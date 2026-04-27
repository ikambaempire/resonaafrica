import { PageShell, PageHero } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Users, Mic2, DollarSign } from "lucide-react";

const benefits = [
  { icon: Star, title: "Build your personal brand", body: "Become a recognized voice in your niche with a polished, consistent show." },
  { icon: Users, title: "Grow your audience", body: "Multi-platform distribution, SEO, and short-form clips that compound reach." },
  { icon: Mic2, title: "Access professional production", body: "Studio-quality production without owning the gear or learning the craft." },
  { icon: DollarSign, title: "Monetize your content", body: "Subscriptions, sponsorships, and premium episodes — built right in." },
];

export default function ForCreators() {
  return (
    <PageShell>
      <PageHero
        eyebrow="For Creators"
        title={<>Built for <span className="text-accent">independent creators</span>.</>}
        subtitle="Everything an African podcaster needs to launch, grow, and earn from a world-class show."
        image="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1200&q=80"
      />
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl bg-card border border-border/60 p-7">
                <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-2">{b.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold h-12 px-8">
              <Link to="/auth">Start Your Podcast <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
