import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { Headphones, Star, ArrowRight } from "lucide-react";
import AutoScroll from "embla-carousel-auto-scroll";

type FeaturedPodcast = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  description: string | null;
  cover_url: string | null;
};

export function FeaturedPodcasts() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["featured-podcasts"],
    queryFn: async (): Promise<FeaturedPodcast[]> => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("id,slug,title,category,description,cover_url")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data as FeaturedPodcast[]) || [];
    },
    refetchInterval: 30_000,
  });

  if (!isLoading && data.length === 0) return null;

  // Duplicate items so the marquee always has enough to scroll smoothly
  const items = data.length > 0 && data.length < 6 ? [...data, ...data, ...data] : data;

  return (
    <section className="py-24 lg:py-32 border-t border-border/40 bg-secondary/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-14">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" /> Featured Podcasts
            </span>
            <h2 className="mt-3 font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
              Hand-picked shows worth your ears.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl">
              The standout African podcasts our editors are listening to right now.
            </p>
          </div>
          <Link to="/discover" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2 transition-all">
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Carousel
        opts={{ align: "start", loop: true, dragFree: true, containScroll: false }}
        plugins={[
          AutoScroll({
            speed: 0.8,
            startDelay: 0,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
          }),
        ]}
        className="relative"
      >
        <CarouselContent className="-ml-4">
          {items.map((p, i) => (
            <CarouselItem key={`${p.id}-${i}`} className="pl-4 basis-[78%] sm:basis-[45%] md:basis-[34%] lg:basis-[26%] xl:basis-[22%]">
              <Link
                to={`/c/${p.slug}`}
                className="group block rounded-3xl overflow-hidden border border-border/60 bg-card hover:border-accent/50 transition-all h-full"
              >
                <div className="aspect-[4/5] overflow-hidden bg-secondary relative">
                  {p.cover_url ? (
                    <img
                      src={p.cover_url}
                      alt={p.title}
                      loading={i < 3 ? "eager" : "lazy"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/60">
                      <Headphones className="w-16 h-16 text-accent" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-[10px] uppercase tracking-[0.18em] font-bold">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                    {p.category || "Podcast"}
                  </span>
                  <h3 className="mt-2 font-display font-bold text-xl text-foreground line-clamp-2">{p.title}</h3>
                  {p.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                    Listen now <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
