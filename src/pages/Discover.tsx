import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { usePublicPodcasts } from "@/hooks/usePodcasts";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Mic2, Loader2, Compass } from "lucide-react";

export default function Discover() {
  const { data: podcasts = [], isLoading } = usePublicPodcasts();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold flex items-center gap-2"><Compass className="w-4 h-4" /> Discover</p>
            <h1 className="mt-2 font-display font-bold text-4xl lg:text-5xl">Podcasts from across Africa</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">Browse shows hosted on Resona Africa.</p>
          </header>

          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : podcasts.length === 0 ? (
            <Card className="p-12 text-center rounded-2xl text-muted-foreground">No podcasts published yet — be the first.</Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {podcasts.map((p) => (
                <Link key={p.id} to={`/c/${p.slug}`} className="group">
                  <Card className="overflow-hidden rounded-2xl border-border/60 transition-all hover:-translate-y-1 hover:shadow-gold">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt={p.title} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square gradient-gold flex items-center justify-center"><Mic2 className="w-10 h-10 text-primary" /></div>
                    )}
                    <div className="p-4">
                      <p className="font-display font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors">{p.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description || p.category}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
