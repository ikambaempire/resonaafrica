import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Play, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReleaseRow {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  published_at: string | null;
  podcast: { slug: string; title: string; cover_url: string | null; category: string | null } | null;
}

function relTime(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return new Date(iso).toLocaleDateString();
}

export function NewReleases() {
  const { data = [] } = useQuery({
    queryKey: ["new-releases-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("id, title, description, cover_url, published_at, podcast:podcasts(slug, title, cover_url, category)")
        .eq("status", "published")
        .eq("is_premium", false)
        .order("published_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data as unknown as ReleaseRow[]).filter((r) => r.podcast);
    },
  });

  if (data.length === 0) return null;
  const [hero, ...rest] = data;

  return (
    <section className="py-24 lg:py-28 border-t border-border/40 bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> New releases
            </span>
            <h2 className="mt-3 font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
              Fresh from the <span className="text-accent">studio</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-xl">
              The latest episodes from creators across the continent — updated in real time.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full self-start">
            <Link to="/discover">Browse all <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Hero release */}
          <Link
            to={`/c/${hero.podcast!.slug}`}
            className="lg:col-span-2 group relative rounded-3xl overflow-hidden border border-border/60 bg-card hover:border-accent/50 transition-all min-h-[320px] lg:min-h-[420px]"
          >
            <div className="absolute inset-0">
              {(hero.cover_url || hero.podcast?.cover_url) ? (
                <img
                  src={hero.cover_url || hero.podcast!.cover_url!}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full gradient-gold" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
            </div>
            <div className="relative h-full flex flex-col justify-end p-7 lg:p-10">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] font-semibold mb-3">
                <span className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground">New</span>
                <span className="text-foreground/70">{relTime(hero.published_at)}</span>
                {hero.podcast?.category && <span className="text-foreground/50">· {hero.podcast.category}</span>}
              </div>
              <h3 className="font-display font-bold text-3xl lg:text-4xl text-foreground leading-tight">{hero.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">From <span className="font-semibold text-foreground">{hero.podcast?.title}</span></p>
              {hero.description && <p className="mt-3 text-foreground/75 line-clamp-2 max-w-2xl">{hero.description}</p>}
              <div className="mt-5">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-semibold text-sm shadow-gold group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-current" /> Play episode
                </span>
              </div>
            </div>
          </Link>

          {/* Side cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {rest.slice(0, 3).map((r) => (
              <Link
                key={r.id}
                to={`/c/${r.podcast!.slug}`}
                className="group flex gap-4 p-3 rounded-2xl border border-border/60 bg-card hover:border-accent/50 hover:bg-secondary/30 transition-all"
              >
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative">
                  {(r.cover_url || r.podcast?.cover_url) ? (
                    <img src={r.cover_url || r.podcast!.cover_url!} alt="" loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-gold" />
                  )}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                    <Play className="w-6 h-6 text-accent opacity-0 group-hover:opacity-100 fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-accent font-semibold">
                    <span>New</span><span className="text-muted-foreground">· {relTime(r.published_at)}</span>
                  </div>
                  <p className="mt-1 font-display font-semibold text-foreground line-clamp-2 leading-snug">{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">{r.podcast?.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
