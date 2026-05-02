import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { usePublicPodcasts } from "@/hooks/usePodcasts";
import { Card } from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";
import { Mic2, Loader2, Compass, ArrowLeft } from "lucide-react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { useMemo } from "react";

export default function Discover() {
  const { data: podcasts = [], isLoading } = usePublicPodcasts();
  const [params, setParams] = useSearchParams();
  const activeSlug = params.get("category");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    podcasts.forEach((p) => m.set((p.category || "").toLowerCase(), (m.get((p.category || "").toLowerCase()) || 0) + 1));
    return m;
  }, [podcasts]);

  const filtered = activeSlug ? podcasts.filter((p) => (p.category || "").toLowerCase() === activeSlug) : [];
  const activeCat = getCategory(activeSlug);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold flex items-center gap-2">
              <Compass className="w-4 h-4" /> Discover
            </p>
            <h1 className="mt-2 font-display font-bold text-4xl lg:text-5xl">
              {activeCat ? activeCat.name : "Podcasts from across Africa"}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              {activeCat ? activeCat.blurb : "Pick a category and dive into shows hosted on Resona Africa."}
            </p>
          </header>

          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : !activeSlug ? (
            <>
              <h2 className="font-display font-bold text-2xl mb-5">Browse by category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {CATEGORIES.map((c) => {
                  const n = counts.get(c.slug) || 0;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => setParams({ category: c.slug })}
                      className="group text-left"
                    >
                      <Card className="overflow-hidden rounded-2xl border-border/60 transition-all hover:-translate-y-1 hover:shadow-gold">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img src={c.thumbnail} alt={c.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                          <span className="absolute top-3 left-3 text-2xl">{c.emoji}</span>
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className="font-display font-bold text-lg text-foreground">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{n} podcast{n === 1 ? "" : "s"}</p>
                          </div>
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>

              {podcasts.length > 0 && (
                <section className="mt-16">
                  <h2 className="font-display font-bold text-2xl mb-5">Newly added</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {podcasts.slice(0, 8).map((p) => <PodcastCard key={p.id} p={p} />)}
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setParams({})} className="text-sm text-accent inline-flex items-center gap-1 mb-5">
                <ArrowLeft className="w-4 h-4" /> All categories
              </button>
              {filtered.length === 0 ? (
                <Card className="p-12 text-center rounded-2xl text-muted-foreground">
                  No podcasts in {activeCat?.name} yet — be the first to publish.
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filtered.map((p) => <PodcastCard key={p.id} p={p} />)}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PodcastCard({ p }: { p: { id: string; slug: string; title: string; description: string | null; category: string | null; cover_url: string | null } }) {
  return (
    <Link to={`/c/${p.slug}`} className="group">
      <Card className="overflow-hidden rounded-2xl border-border/60 transition-all hover:-translate-y-1 hover:shadow-gold">
        {p.cover_url ? (
          <img src={p.cover_url} alt={p.title} className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square gradient-gold flex items-center justify-center"><Mic2 className="w-10 h-10 text-primary" /></div>
        )}
        <div className="p-4">
          <p className="font-display font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors">{p.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description || getCategory(p.category)?.name || p.category}</p>
        </div>
      </Card>
    </Link>
  );
}
