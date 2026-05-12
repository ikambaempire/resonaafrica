import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { CategoryChips } from "@/components/CategoryChips";
import { EpisodeCard } from "@/components/EpisodeCard";
import { Loader2, Compass, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePublicPodcasts } from "@/hooks/usePodcasts";

type EpRow = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  duration_seconds: number | null;
  published_at: string | null;
  created_at: string;
  podcast_id: string;
  podcasts: { title: string; slug: string; cover_url: string | null; category: string | null } | null;
};

export default function Discover() {
  const [params] = useSearchParams();
  const activeCategory = params.get("category");
  const { data: podcasts = [] } = usePublicPodcasts();
  const [episodes, setEpisodes] = useState<EpRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("episodes")
        .select("id,title,description,cover_url,duration_seconds,published_at,created_at,podcast_id,podcasts(title,slug,cover_url,category)")
        .eq("status", "published")
        .eq("is_premium", false)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(120);
      setEpisodes((data ?? []) as any);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!activeCategory) return episodes;
    return episodes.filter((e) => (e.podcasts?.category || "").toLowerCase() === activeCategory);
  }, [episodes, activeCategory]);

  const trending = useMemo(() => episodes.slice(0, 8), [episodes]);
  const newest = useMemo(() => episodes.slice(0, 12), [episodes]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold flex items-center gap-2">
              <Compass className="w-4 h-4" /> Discover
            </p>
            <h1 className="mt-2 font-display font-bold text-3xl lg:text-4xl">Find your next favourite podcast</h1>
          </header>

          <div className="sticky top-16 z-20 bg-background/85 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-border/40">
            <CategoryChips />
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : activeCategory ? (
            <Section title={activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} icon={<Compass className="w-5 h-5 text-accent" />}>
              {filtered.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center">No episodes in this category yet.</p>
              ) : (
                <Grid eps={filtered} />
              )}
            </Section>
          ) : (
            <>
              <Section title="Trending now" icon={<TrendingUp className="w-5 h-5 text-accent" />}>
                <Grid eps={trending} />
              </Section>
              <Section title="New episodes" icon={<Sparkles className="w-5 h-5 text-accent" />}>
                <Grid eps={newest} />
              </Section>
              {podcasts.length > 0 && (
                <Section title="Browse channels" icon={<Compass className="w-5 h-5 text-accent" />}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {podcasts.slice(0, 12).map((p) => (
                      <a key={p.id} href={`/c/${p.slug}`} className="group block">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border/40">
                          {p.cover_url ? (
                            <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : <div className="w-full h-full gradient-gold" />}
                        </div>
                        <p className="mt-2 text-sm font-semibold line-clamp-1 group-hover:text-accent transition-colors">{p.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.category}</p>
                      </a>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display font-bold text-2xl mb-5 flex items-center gap-2">{icon} {title}</h2>
      {children}
    </section>
  );
}

function Grid({ eps }: { eps: EpRow[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8">
      {eps.map((e) => (
        <EpisodeCard
          key={e.id}
          ep={e}
          cover={e.podcasts?.cover_url}
          podcastTitle={e.podcasts?.title}
          podcastSlug={e.podcasts?.slug}
        />
      ))}
    </div>
  );
}
