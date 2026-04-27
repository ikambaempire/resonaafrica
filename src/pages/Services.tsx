import { PageShell, PageHero } from "@/components/PageShell";
import { ClipboardList, Mic2, Scissors, Share2, TrendingUp, BarChart3 } from "lucide-react";

const services = [
  {
    icon: ClipboardList,
    title: "Pre-Production",
    items: ["Podcast strategy development", "Content planning & episode roadmaps", "Guest research and preparation"],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
  },
  {
    icon: Mic2,
    title: "Production",
    items: ["Video & audio recording", "Studio and on-location setups", "Multi-camera direction"],
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=900&q=80",
  },
  {
    icon: Scissors,
    title: "Post-Production",
    items: ["Editing — video and audio", "Branding: intro, outro, thumbnails", "Show notes & transcripts"],
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=900&q=80",
  },
  {
    icon: Share2,
    title: "Distribution",
    items: ["Publishing on YouTube & Spotify", "Apple Podcasts and beyond", "Scheduling and management"],
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=900&q=80",
  },
  {
    icon: TrendingUp,
    title: "Growth",
    items: ["Social media clips", "Content repurposing", "Audience growth strategies"],
    image: "https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=900&q=80",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    items: ["Performance tracking", "Cross-platform insights", "Optimization recommendations"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80",
  },
];

export default function Services() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Our Services"
        title={<>End-to-end <span className="text-accent">podcast services</span>.</>}
        subtitle="From idea to release, we cover every part of the podcast lifecycle so you can focus on the conversation."
      />
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          {services.map((s, i) => (
            <div
              key={s.title}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}
            >
              <div className="overflow-hidden rounded-3xl border border-border/60 shadow-soft [direction:ltr]">
                <img src={s.image} alt={s.title} loading="lazy" className="w-full aspect-[4/3] object-cover" />
              </div>
              <div className="[direction:ltr]">
                <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display font-bold text-3xl lg:text-4xl mb-4">{s.title}</h2>
                <ul className="space-y-2 text-muted-foreground">
                  {s.items.map((it) => (
                    <li key={it} className="flex gap-2"><span className="text-accent">•</span> {it}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
