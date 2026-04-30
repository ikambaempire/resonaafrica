-- PODCASTS
CREATE TABLE public.podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_url TEXT,
  category TEXT,
  language TEXT DEFAULT 'en',
  explicit BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_podcasts_owner ON public.podcasts(owner_id);
CREATE INDEX idx_podcasts_published ON public.podcasts(is_published) WHERE is_published = true;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published podcasts" ON public.podcasts
  FOR SELECT USING (is_published = true);
CREATE POLICY "Owners can view own podcasts" ON public.podcasts
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all podcasts" ON public.podcasts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can insert own podcasts" ON public.podcasts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own podcasts" ON public.podcasts
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can update all podcasts" ON public.podcasts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can delete own podcasts" ON public.podcasts
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can delete podcasts" ON public.podcasts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ENUMS
CREATE TYPE public.episode_status AS ENUM ('draft','scheduled','published');
CREATE TYPE public.hosting_type AS ENUM ('native','embed');
CREATE TYPE public.embed_provider AS ENUM ('youtube','spotify','apple','soundcloud','other');

-- PREMIUM SUBSCRIPTIONS (created early so has_active_premium can reference it)
CREATE TABLE public.premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, podcast_id)
);
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscriptions" ON public.premium_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners view subs to their podcasts" ON public.premium_subscriptions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.podcasts p WHERE p.id = podcast_id AND p.owner_id = auth.uid())
  );
CREATE POLICY "Admins view all subs" ON public.premium_subscriptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.has_active_premium(_user_id uuid, _podcast_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.premium_subscriptions
    WHERE user_id = _user_id AND podcast_id = _podcast_id
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;

-- EPISODES
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  hosting hosting_type NOT NULL DEFAULT 'native',
  media_url TEXT,
  media_kind TEXT,
  embed_provider embed_provider,
  embed_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status episode_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  transcript TEXT,
  ai_clips JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (podcast_id, slug)
);
CREATE INDEX idx_episodes_podcast ON public.episodes(podcast_id);
CREATE INDEX idx_episodes_owner ON public.episodes(owner_id);
CREATE INDEX idx_episodes_status ON public.episodes(status);
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published non-premium episodes" ON public.episodes
  FOR SELECT USING (status = 'published' AND is_premium = false);
CREATE POLICY "Owners can view own episodes" ON public.episodes
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all episodes" ON public.episodes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Premium subscribers can view premium episodes" ON public.episodes
  FOR SELECT TO authenticated USING (
    status = 'published' AND is_premium = true
    AND public.has_active_premium(auth.uid(), podcast_id)
  );
CREATE POLICY "Owners can insert episodes" ON public.episodes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update episodes" ON public.episodes
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can update episodes" ON public.episodes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can delete episodes" ON public.episodes
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can delete episodes" ON public.episodes
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- EPISODE PLAYS
CREATE TABLE public.episode_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID,
  anon_id TEXT,
  listened_seconds INTEGER NOT NULL DEFAULT 0,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_plays_episode ON public.episode_plays(episode_id);
CREATE INDEX idx_plays_podcast ON public.episode_plays(podcast_id);
CREATE INDEX idx_plays_created ON public.episode_plays(created_at);
ALTER TABLE public.episode_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record plays" ON public.episode_plays
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view own podcast plays" ON public.episode_plays
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.podcasts p WHERE p.id = podcast_id AND p.owner_id = auth.uid())
  );
CREATE POLICY "Admins can view all plays" ON public.episode_plays
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- BOOKMARKS & WATCH LATER
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_id)
);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.watch_later (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_id)
);
ALTER TABLE public.watch_later ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own watch later" ON public.watch_later
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TIPS
CREATE TABLE public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL,
  user_id UUID,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view own tips" ON public.tips
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.podcasts p WHERE p.id = podcast_id AND p.owner_id = auth.uid())
  );
CREATE POLICY "Tippers view own tips" ON public.tips
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all tips" ON public.tips
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all',
  is_active BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active announcements" ON public.announcements
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER trg_podcasts_updated BEFORE UPDATE ON public.podcasts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_episodes_updated BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tips_updated BEFORE UPDATE ON public.tips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.premium_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_anns_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('podcast-covers', 'podcast-covers', true),
  ('episode-media', 'episode-media', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read podcast covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'podcast-covers');
CREATE POLICY "Public read episode media" ON storage.objects
  FOR SELECT USING (bucket_id = 'episode-media');
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own podcast covers" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'podcast-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own podcast covers" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'podcast-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own podcast covers" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'podcast-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own episode media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'episode-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own episode media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'episode-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own episode media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'episode-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);