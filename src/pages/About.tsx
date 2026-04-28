import { PageShell, PageHero } from "@/components/PageShell";
import { Heart, Globe, Sparkles } from "lucide-react";

const values = [
  { icon: Heart, title: "Authentic storytelling", body: "We believe African stories deserve to be told by Africans — with depth, nuance, and craft." },
  { icon: Globe, title: "Continental scale", body: "We build infrastructure that serves creators from Lagos to Nairobi, Cairo to Cape Town." },
  { icon: Sparkles, title: "Production excellence", body: "World-class quality is the baseline, not the ceiling, for every show on the platform." },
];

export default function About() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About Us"
        title={<>About <span className="text-accent">Resona Africa</span>.</>}
        subtitle="A podcast production and growth initiative powered by iKAMBA, built to amplify African voices at scale."
        image="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80"
      />
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            Resona Africa was created to address the fragmentation in the African podcast ecosystem by providing a structured, end-to-end solution for creators and organizations.
          </p>
          <p>
            We believe podcasting is one of the most powerful tools for storytelling, education, and influence across Africa.
          </p>
          <p className="text-foreground font-semibold text-xl font-display">
            Our mission is to amplify African voices at scale through high-quality production, strategic growth systems, and technology-driven distribution.
          </p>
        </div>
      </section>
      <section className="py-20 lg:py-28 border-t border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-center mb-12">What we stand for.</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-card border border-border/60 p-7">
                <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
