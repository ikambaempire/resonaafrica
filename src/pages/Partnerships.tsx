import { PageShell, PageHero } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Mic2, Camera, Handshake, Megaphone, Target, Repeat, TrendingUp } from "lucide-react";

const partners = [
  { icon: Mic2, title: "Creators", body: "Podcasters and hosts looking for production, distribution, and growth support." },
  { icon: Camera, title: "Production studios", body: "Studios across Africa joining a continental network of partner facilities." },
  { icon: Handshake, title: "Strategic partners", body: "Platforms, agencies, and media houses that share our mission." },
  { icon: Megaphone, title: "Sponsors", body: "Brands wanting authentic, measurable reach into African audiences." },
];

const approach = [
  { icon: Target, title: "Clear roles", body: "Defined responsibilities and outcomes from day one." },
  { icon: Repeat, title: "Shared growth objectives", body: "Aligned KPIs that move both brands forward together." },
  { icon: TrendingUp, title: "Long-term collaboration", body: "We build relationships, not transactions." },
];

export default function Partnerships() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Partnerships"
        title={<>Building the future of African media <span className="text-accent">together</span>.</>}
        subtitle="Amplify Africa thrives on collaboration. We partner with creators, studios, brands, and platforms to grow the ecosystem."
      />
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl lg:text-4xl mb-10">Who we collaborate with.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {partners.map((p) => (
              <div key={p.title} className="rounded-2xl bg-card border border-border/60 p-6">
                <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center mb-4">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 lg:py-28 border-t border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl lg:text-4xl mb-10 text-center">Our approach.</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {approach.map((a) => (
              <div key={a.title} className="rounded-2xl bg-card border border-border/60 p-7">
                <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center mb-4">
                  <a.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{a.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold h-12 px-8">
              <Link to="/contact">Become a Partner <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
