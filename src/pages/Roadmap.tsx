import { PageShell, PageHero } from "@/components/PageShell";
import { Rocket, Megaphone, TrendingUp } from "lucide-react";

const phases = [
  {
    icon: Rocket,
    label: "Phase 1",
    duration: "Month 1",
    title: "Setup & Positioning",
    items: ["Setup & positioning", "Brand identity", "Flagship podcast development"],
  },
  {
    icon: Megaphone,
    label: "Phase 2",
    duration: "Months 2–3",
    title: "Production & Launch",
    items: ["Production & launch", "Distribution setup", "Marketing campaigns"],
  },
  {
    icon: TrendingUp,
    label: "Phase 3",
    duration: "Months 4–6",
    title: "Growth & Scaling",
    items: ["Growth & scaling", "Portfolio expansion", "Sponsorship activation"],
  },
];

export default function Roadmap() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Implementation Roadmap"
        title={<>Our <span className="text-accent">six-month</span> launch plan.</>}
        subtitle="A clear, structured path from kickoff to a fully scaling podcast brand."
      />
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-5">
            {phases.map((p, i) => (
              <div key={p.label} className="rounded-3xl bg-card border border-border/60 p-7 relative overflow-hidden">
                <span className="absolute top-4 right-4 font-display font-bold text-7xl text-accent/10">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center mb-5">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {p.label} · {p.duration}
                </span>
                <h3 className="mt-2 font-display font-bold text-2xl mb-4">{p.title}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2"><span className="text-accent">•</span> {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
