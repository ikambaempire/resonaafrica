import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users, Loader2 } from "lucide-react";
import { usePublicStudios } from "@/hooks/useStudios";

const fmtMoney = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

export default function Studios() {
  const { data: studios = [], isLoading } = usePublicStudios();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" /> Studios</p>
              <h1 className="font-display font-bold text-4xl mt-2">Book a podcast studio across Africa</h1>
              <p className="text-muted-foreground mt-2">Pro recording spaces with the gear, treatment, and engineers you need.</p>
            </div>
            <Link to="/studios/signup">
              <Button variant="outline" className="rounded-full">List your studio</Button>
            </Link>
          </div>

          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-accent" /> : studios.length === 0 ? (
            <Card className="p-12 text-center rounded-3xl border-dashed">
              <Building2 className="w-10 h-10 text-accent mx-auto mb-3" />
              <h2 className="font-display font-bold text-2xl">No studios yet</h2>
              <p className="text-muted-foreground mt-2">Are you a studio owner? <Link to="/studios/signup" className="text-accent">List your studio</Link>.</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {studios.map((s) => (
                <Link to={`/studios/${s.slug}`} key={s.id} className="group">
                  <Card className="rounded-2xl overflow-hidden border-border/60 hover:border-accent/40 transition-colors">
                    <div className="aspect-[4/3] bg-secondary overflow-hidden">
                      {s.cover_url || s.photos[0] ? (
                        <img src={s.cover_url || s.photos[0]} alt={s.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : <div className="w-full h-full gradient-gold flex items-center justify-center"><Building2 className="w-10 h-10 text-primary" /></div>}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-bold text-lg group-hover:text-accent transition-colors">{s.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {[s.city, s.country].filter(Boolean).join(", ") || "Location TBA"}</p>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-semibold text-accent">{fmtMoney(s.hourly_rate_cents, s.currency)}/hr</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {s.capacity}</span>
                      </div>
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
