-- Add studio_owner role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'studio_owner';

-- ============ STUDIOS ============
CREATE TABLE public.studios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  city text,
  country text,
  description text,
  hourly_rate_cents integer NOT NULL DEFAULT 5000,
  currency text NOT NULL DEFAULT 'usd',
  photos text[] NOT NULL DEFAULT '{}',
  amenities text[] NOT NULL DEFAULT '{}',
  capacity integer NOT NULL DEFAULT 4,
  cover_url text,
  contact_email text,
  contact_phone text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_studios_owner ON public.studios(owner_id);
CREATE INDEX idx_studios_published ON public.studios(is_published);
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published studios" ON public.studios
  FOR SELECT USING (is_published = true);
CREATE POLICY "Owners view own studios" ON public.studios
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins view all studios" ON public.studios
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners insert studios" ON public.studios
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own studios" ON public.studios
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins update all studios" ON public.studios
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners delete own studios" ON public.studios
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins delete studios" ON public.studios
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_studios_updated_at BEFORE UPDATE ON public.studios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ STUDIO AVAILABILITY ============
CREATE TABLE public.studio_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_avail_studio ON public.studio_availability(studio_id);
ALTER TABLE public.studio_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read availability of published studios" ON public.studio_availability
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.studios s WHERE s.id = studio_id AND s.is_published = true));
CREATE POLICY "Owners manage own availability" ON public.studio_availability
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.studios s WHERE s.id = studio_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.studios s WHERE s.id = studio_id AND s.owner_id = auth.uid()));
CREATE POLICY "Admins manage availability" ON public.studio_availability
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============ STUDIO BOOKINGS ============
CREATE TABLE public.studio_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  booker_user_id uuid,
  booker_email text NOT NULL,
  booker_name text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  hours numeric(5,2) NOT NULL,
  total_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending_payment',
  paddle_transaction_id text UNIQUE,
  environment text NOT NULL DEFAULT 'sandbox',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_studio ON public.studio_bookings(studio_id);
CREATE INDEX idx_bookings_owner ON public.studio_bookings(owner_id);
CREATE INDEX idx_bookings_booker ON public.studio_bookings(booker_user_id);
CREATE INDEX idx_bookings_start ON public.studio_bookings(start_at);
ALTER TABLE public.studio_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view bookings for their studios" ON public.studio_bookings
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Bookers view own bookings" ON public.studio_bookings
  FOR SELECT TO authenticated USING (auth.uid() = booker_user_id);
CREATE POLICY "Admins view all bookings" ON public.studio_bookings
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create a booking" ON public.studio_bookings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners update bookings for their studios" ON public.studio_bookings
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins update all bookings" ON public.studio_bookings
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.studio_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PODCAST SUBSCRIBERS ============
CREATE TABLE public.podcast_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id uuid NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  email text NOT NULL,
  user_id uuid,
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (podcast_id, email)
);
CREATE INDEX idx_psubs_podcast ON public.podcast_subscribers(podcast_id);
ALTER TABLE public.podcast_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to a podcast" ON public.podcast_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Subscribers view own row" ON public.podcast_subscribers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners view their podcast subscribers" ON public.podcast_subscribers
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.podcasts p WHERE p.id = podcast_id AND p.owner_id = auth.uid())
  );
CREATE POLICY "Admins view all podcast subscribers" ON public.podcast_subscribers
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============ NEWSLETTER SUBSCRIBERS ============
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view newsletter" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============ helper: slugify-friendly count for slug uniqueness done in app ============