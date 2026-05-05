-- Categories: admin-managed list (replaces hard-coded list in src/lib/categories.ts)
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  emoji text,
  thumbnail_url text,
  blurb text,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed defaults (matches current static list)
INSERT INTO public.categories (slug, name, emoji, thumbnail_url, blurb, sort_order) VALUES
  ('business','Business','💼','https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80','Founders, strategy & markets',10),
  ('technology','Technology','💻','https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80','Software, AI & innovation',20),
  ('finance','Finance','📈','https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80','Money, investing & fintech',30),
  ('health','Health & Wellness','🩺','https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80','Mind, body & medicine',40),
  ('entertainment','Entertainment','🎬','https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80','Film, music & pop culture',50),
  ('education','Education','🎓','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80','Learn anything, anytime',60),
  ('news','News & Politics','📰','https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80','Current affairs & analysis',70),
  ('sports','Sports','⚽','https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80','Football, athletics & more',80),
  ('society','Society & Culture','🌍','https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80','Stories from the continent',90),
  ('comedy','Comedy','😂','https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&q=80','Laugh out loud',100),
  ('religion','Religion & Spirituality','🙏','https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80','Faith & inner life',110),
  ('lifestyle','Lifestyle','✨','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80','Living well, your way',120);