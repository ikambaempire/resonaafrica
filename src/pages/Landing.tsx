import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic2,
  TrendingUp,
  DollarSign,
  BarChart3,
  Sparkles,
  Globe2,
  Play,
  Headphones,
  Youtube,
  Music2,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

const features = [
  {
    icon: Mic2,
    title: "Host audio & video",
    description: "Upload once, distribute everywhere. Lossless audio, HD video, smart transcoding for African bandwidths.",
  },
  {
    icon: TrendingUp,
    title: "Grow your audience",
    description: "Discovery on the Amplify network plus syndication to YouTube, Spotify, and Apple Podcasts.",
  },
  {
    icon: BarChart3,
    title: "Unified analytics",
    description: "Plays, watch time, retention, and subscriber growth — across every platform in one view.",
  },
  {
    icon: DollarSign,
    title: "Monetize from day one",
    description: "Paid subscriptions, premium episodes, listener tips, and a sponsorship marketplace.",
  },
  {
    icon: Sparkles,
    title: "AI clip generator",
    description: "Turn long episodes into short, social-ready clips with auto-captions in seconds.",
  },
  {
    icon: Globe2,
    title: "Built for Africa",
    description: "Mobile-first, low-bandwidth optimized, local payment rails, and multilingual support.",
  },
];

const steps = [
  { n: "01", title: "Create your channel", body: "Sign up free, claim your handle, and customize your creator page." },
  { n: "02", title: "Upload your podcast", body: "Drop in audio or video. We handle hosting, encoding, and distribution." },
  { n: "03", title: "Grow & monetize", body: "Track unified analytics, connect platforms, and turn listeners into supporters." },
];

const testimonials = [
  {
    quote: "Amplify Africa finally gave me one place to manage my YouTube and Spotify podcast. The analytics alone are worth it.",
    name: "Wanjiru K.",
    role: "Host, Nairobi Founders",
  },
  {
    quote: "I doubled my paid subscribers in two months using premium episodes. The creator tools are world-class.",
    name: "Chinedu O.",
    role: "Host, Lagos Tea",
  },
  {
    quote: "The AI clips feature is a game changer. My TikTok grew faster than my main feed.",
    name: "Thandiwe M.",
    role: "Host, The Real Joburg",
  },
];

const platformLogos = [
  { name: "YouTube", icon: Youtube },
  { name: "Spotify", icon: Music2 },
  { name: "Apple Podcasts", icon: Headphones },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Now in beta — free for early creators
              </span>
              <h1 className="mt-6 font-display font-bold text-5xl lg:text-7xl leading-[1.05] tracking-tight text-foreground">
                The operating system for{" "}
                <span className="text-accent">African podcasters</span>.
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Host video and audio, grow your audience, distribute everywhere, and monetize your content — all from one beautifully simple dashboard.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold text-base h-12 px-7">
                  <Link to="/auth">
                    Start creating free <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full font-semibold text-base h-12 px-7 border-border">
                  <Link to="/discover">
                    <Play className="w-4 h-4 mr-1" /> Browse podcasts
                  </Link>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> No credit card</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> Unlimited uploads</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> Cancel anytime</span>
              </div>
            </motion.div>

            {/* Mock dashboard preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
                <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">amplify.africa/dashboard</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total plays", value: "248K", trend: "+18%" },
                      { label: "Subscribers", value: "12.4K", trend: "+24%" },
                      { label: "Revenue", value: "$3.2K", trend: "+31%" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-secondary/60 p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        <p className="mt-1 text-xl font-display font-bold text-foreground">{stat.value}</p>
                        <p className="text-[10px] text-success font-semibold">{stat.trend}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-secondary/60 p-4">
                    <div className="flex items-end justify-between h-24 gap-1.5">
                      {[35, 55, 42, 70, 58, 88, 75, 95, 82, 100, 90, 78].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-md bg-gradient-to-t from-accent/40 to-accent"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">Plays — last 12 weeks</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
                    <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center shrink-0">
                      <Mic2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">Episode 24 — Building in Lagos</p>
                      <p className="text-[10px] text-muted-foreground">Published yesterday · 12.4K plays</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-primary fill-primary ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Platform logos */}
          <div className="mt-20 lg:mt-28">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Distribute everywhere your audience listens
            </p>
            <div className="flex items-center justify-center flex-wrap gap-x-12 gap-y-6 opacity-70">
              {platformLogos.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-foreground">
                  <p.icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
              Everything you need to run a <span className="text-accent">world-class podcast</span>.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Stop juggling six tools. Amplify replaces your host, your analytics, your monetization, and your distribution.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl bg-card border border-border/60 p-6 hover:border-accent/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 lg:py-32 border-t border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
              From idea to audience in <span className="text-accent">three steps</span>.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl bg-card border border-border/60 p-8">
                <span className="font-display font-bold text-5xl text-accent/30">{s.n}</span>
                <h3 className="mt-4 font-display font-bold text-2xl text-foreground">{s.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
              Loved by African creators.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl bg-card border border-border/60 p-7">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-accent text-base">★</span>
                  ))}
                </div>
                <p className="text-foreground leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 pt-5 border-t border-border/60">
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-3xl gradient-gold p-12 lg:p-16 text-center overflow-hidden shadow-gold">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="font-display font-bold text-4xl lg:text-5xl tracking-tight text-primary">
                Ready to amplify your voice?
              </h2>
              <p className="mt-4 text-primary/80 text-lg max-w-xl mx-auto">
                Join the next generation of African podcasters. Free to start, no credit card required.
              </p>
              <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold text-base h-12 px-8">
                <Link to="/auth">
                  Create your channel <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
