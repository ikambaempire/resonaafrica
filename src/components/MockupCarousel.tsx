import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Scissors, BarChart3, Mic2, DollarSign, Play, Clock, TrendingUp } from "lucide-react";
import { Waveform } from "./Waveform";

interface Slide {
  tag: string;
  title: string;
  body: string;
  device: "phone" | "tablet";
  render: () => React.ReactNode;
}

function ClipScreen() {
  return (
    <div className="h-full w-full p-4 flex flex-col gap-3 bg-gradient-to-b from-card to-background">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent" />
        <p className="font-display font-bold text-sm text-foreground">AI Clips</p>
      </div>
      <div className="rounded-xl bg-secondary/60 p-3 space-y-2">
        <div className="aspect-video rounded-lg bg-gradient-to-br from-accent/30 to-primary/40 flex items-center justify-center">
          <Play className="w-8 h-8 text-accent fill-accent" />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>0:14</span><span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent">42s</span><span>0:56</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-accent rounded-full" />
        </div>
      </div>
      <div className="space-y-1.5">
        {["Funny one-liners that went viral", "Emotional moment about failure", "Hot take on Africa's tech"].map((t, i) => (
          <div key={i} className={`text-[10px] p-2 rounded-lg flex items-center gap-2 ${i === 0 ? "bg-accent/10 border border-accent/30" : "bg-secondary/40"}`}>
            <Scissors className="w-3 h-3 text-accent shrink-0" />
            <span className="text-foreground truncate flex-1">{t}</span>
            <Clock className="w-3 h-3 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="h-full w-full p-4 flex flex-col gap-3 bg-gradient-to-b from-card to-background">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-accent" />
        <p className="font-display font-bold text-sm text-foreground">Analytics</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[{ v: "12.4K", l: "Plays", c: "+34%" }, { v: "27m", l: "Avg time", c: "+12%" }].map((s, i) => (
          <div key={i} className="rounded-xl bg-secondary/50 p-2.5">
            <p className="font-display font-bold text-lg text-foreground">{s.v}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
            <p className="text-[9px] text-success mt-1 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{s.c}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-secondary/50 p-3 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Last 7 days</p>
        <div className="flex items-end gap-1.5 h-20">
          {[40, 65, 50, 80, 55, 90, 100].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-accent/40 to-accent" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerScreen() {
  return (
    <div className="h-full w-full p-4 flex flex-col gap-3 bg-gradient-to-b from-card to-background">
      <div className="flex items-center gap-2">
        <Mic2 className="w-4 h-4 text-accent" />
        <p className="font-display font-bold text-sm text-foreground">Now playing</p>
      </div>
      <div className="rounded-xl bg-secondary/60 p-3 space-y-3 flex-1">
        <div className="aspect-square rounded-lg gradient-gold flex items-center justify-center">
          <Mic2 className="w-12 h-12 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground line-clamp-1">Building in Lagos</p>
          <p className="text-[10px] text-muted-foreground">Tomi Davies · 47:12</p>
        </div>
        <Waveform bars={20} active />
        <div className="flex items-center justify-center gap-3">
          <div className="w-7 h-7 rounded-full bg-secondary" />
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Play className="w-4 h-4 text-primary fill-primary ml-0.5" />
          </div>
          <div className="w-7 h-7 rounded-full bg-secondary" />
        </div>
      </div>
    </div>
  );
}

function MonetizationScreen() {
  return (
    <div className="h-full w-full p-4 flex flex-col gap-3 bg-gradient-to-b from-card to-background">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-accent" />
        <p className="font-display font-bold text-sm text-foreground">Monetization</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 p-3 border border-accent/30">
        <p className="text-[9px] uppercase tracking-wider text-accent">This month</p>
        <p className="font-display font-bold text-2xl text-foreground mt-1">$2,840</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">+22% vs last month</p>
      </div>
      <div className="space-y-1.5">
        {[
          { src: "Premium subs", v: "$1,820" },
          { src: "Tips", v: "$640" },
          { src: "Sponsors", v: "$380" },
        ].map((r, i) => (
          <div key={i} className="text-[10px] p-2 rounded-lg bg-secondary/40 flex items-center justify-between">
            <span className="text-muted-foreground">{r.src}</span>
            <span className="font-semibold text-foreground">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const slides: Slide[] = [
  { tag: "AI CLIPS", title: "Turn one episode into 4 viral shorts", body: "Tell the AI what to focus on, then trim and download MP4 clips ready for social.", device: "phone", render: ClipScreen },
  { tag: "ANALYTICS", title: "Plays, retention & revenue in one view", body: "See how every episode performs across platforms — daily, weekly and per-region.", device: "tablet", render: AnalyticsScreen },
  { tag: "PLAYER", title: "A premium listening experience", body: "Beautiful, fast players that adapt to every show — with smart chapters built in.", device: "phone", render: PlayerScreen },
  { tag: "MONETIZATION", title: "Get paid in multiple ways", body: "Premium subscriptions, episode tips, and brand sponsorships — all from one dashboard.", device: "tablet", render: MonetizationScreen },
];

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 240 }}>
      <div className="relative rounded-[36px] border-[10px] border-foreground/10 bg-card shadow-2xl overflow-hidden" style={{ aspectRatio: "9/19.5" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/10 rounded-b-2xl z-10" />
        <div className="h-full w-full pt-6">{children}</div>
      </div>
      <div className="absolute -inset-8 -z-10 rounded-full bg-accent/20 blur-3xl" />
    </div>
  );
}

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 380 }}>
      <div className="relative rounded-[28px] border-[12px] border-foreground/10 bg-card shadow-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {children}
      </div>
      <div className="absolute -inset-10 -z-10 rounded-full bg-accent/20 blur-3xl" />
    </div>
  );
}

export function MockupCarousel() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const s = slides[i];
  const Frame = s.device === "tablet" ? TabletFrame : PhoneFrame;

  return (
    <section className="py-24 lg:py-32 border-t border-border/40 bg-gradient-to-b from-background via-secondary/10 to-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">In your pocket</span>
          <h2 className="mt-3 font-display font-bold text-4xl lg:text-6xl tracking-tight text-foreground">
            Everything you need <span className="text-accent">on every device</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            See how creators record, edit and grow their show — right from their phone or tablet.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Mockup */}
          <div className="relative h-[460px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Frame>{s.render()}</Frame>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Copy */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-xs uppercase tracking-[0.22em] text-accent font-semibold">{s.tag}</span>
                <h3 className="mt-3 font-display font-bold text-3xl lg:text-5xl tracking-tight text-foreground leading-tight">
                  {s.title}
                </h3>
                <p className="mt-5 text-lg text-muted-foreground max-w-md">{s.body}</p>
              </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="mt-10 flex items-center gap-2">
              {slides.map((sl, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Show ${sl.tag}`}
                  className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-accent" : "w-5 bg-border hover:bg-muted-foreground/40"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
