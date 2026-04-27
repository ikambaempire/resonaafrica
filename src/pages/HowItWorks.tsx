import { PageShell, PageHero } from "@/components/PageShell";
import { Lightbulb, Target, Mic2, Share2, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const phases = [
  { icon: Lightbulb, title: "Idea", body: "Identify your topic, audience, and unique perspective." },
  { icon: Target, title: "Strategy", body: "We define positioning, format, episode structure, and a 12-month roadmap." },
  { icon: Mic2, title: "Production", body: "Studio or on-location recording with broadcast-grade audio and video." },
  { icon: Share2, title: "Distribution", body: "One upload publishes across YouTube, Spotify, Apple Podcasts and more." },
  { icon: TrendingUp, title: "Growth", body: "Clips, repurposing, SEO, and retention systems compound your audience." },
  { icon: DollarSign, title: "Monetization", body: "Subscriptions, sponsorships, premium episodes — built into the platform." },
];

export default function HowItWorks() {
  return (
    <PageShell>
      <PageHero
        eyebrow="How It Works"
        title={<>The journey from <span className="text-accent">idea to monetization</span>.</>}
        subtitle="A repeatable process that turns African voices into sustainable, growing podcast brands."
      />
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="relative">
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-border lg:-translate-x-px" />
            <div className="space-y-12">
              {phases.map((p, i) => (
                <div key={p.title} className={`relative grid lg:grid-cols-2 gap-6 lg:gap-12 ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}>
                  <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent ring-4 ring-background" />
                  <div className="pl-14 lg:pl-0 [direction:ltr]">
                    <div className="rounded-2xl bg-card border border-border/60 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                          <p.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-display font-bold text-accent">Phase {String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <h3 className="font-display font-bold text-2xl mb-2">{p.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{p.body}</p>
                    </div>
                  </div>
                  <div />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-16 text-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold h-12 px-8">
              <Link to="/auth">Start your podcast <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
