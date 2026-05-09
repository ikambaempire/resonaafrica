import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHero } from "@/components/PageShell";
import { Mic2, MapPin, Globe, Mail, ExternalLink, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Entry = {
  id: string;
  name: string;
  category: string;
  city: string | null;
  country: string | null;
  description: string | null;
  website: string | null;
  contact_email: string | null;
  logo_url: string | null;
  cover_url: string | null;
  tags: string[] | null;
};

export default function Ecosystem() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["ecosystem-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ecosystem_entries")
        .select("*")
        .eq("is_hidden", false)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Entry[];
    },
  });

  const grouped = data.reduce<Record<string, Entry[]>>((acc, e) => {
    (acc[e.category] ||= []).push(e);
    return acc;
  }, {});

  return (
    <PageShell>
      <PageHero
        eyebrow="Ecosystem"
        title="The African podcast ecosystem"
        subtitle="Discover recording studios, post-production teams, voice artists and other partners powering podcasts across the continent."
      />

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {isLoading && (
          <p className="text-center text-muted-foreground">Loading directory…</p>
        )}

        {!isLoading && data.length === 0 && (
          <Card className="rounded-3xl p-12 text-center border-dashed">
            <Sparkles className="w-10 h-10 text-accent mx-auto mb-3" />
            <h2 className="font-display font-bold text-2xl text-foreground">Directory coming online</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Studios and service providers are being added by the Resona Africa team. Check back soon.
            </p>
          </Card>
        )}

        <div className="space-y-12">
          {Object.entries(grouped).map(([cat, entries]) => (
            <div key={cat}>
              <h2 className="font-display font-bold text-2xl text-foreground mb-5 flex items-center gap-2">
                <Mic2 className="w-5 h-5 text-accent" /> {cat}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {entries.map((e) => (
                  <Card key={e.id} className="rounded-2xl overflow-hidden border-border/60 bg-card hover:border-accent/50 transition-colors">
                    {e.cover_url && (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img src={e.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        {e.logo_url ? (
                          <img src={e.logo_url} alt={`${e.name} logo`} className="w-12 h-12 rounded-xl object-cover border border-border/60" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Mic2 className="w-5 h-5 text-accent" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-lg text-foreground truncate">{e.name}</h3>
                          {(e.city || e.country) && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {[e.city, e.country].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      {e.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{e.description}</p>}
                      {e.tags && e.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {e.tags.slice(0, 4).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-3 text-xs">
                        {e.website && (
                          <a href={e.website} target="_blank" rel="noreferrer" className="text-accent font-semibold inline-flex items-center gap-1 hover:underline">
                            <Globe className="w-3 h-3" /> Website <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {e.contact_email && (
                          <a href={`mailto:${e.contact_email}`} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Contact
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
