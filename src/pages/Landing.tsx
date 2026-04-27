import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic2,
  TrendingUp,
  DollarSign,
  BarChart3,
  Sparkles,
  Globe2,
  ArrowRight,
  Target,
  EyeOff,
  Wallet,
  Lightbulb,
  Video,
  Share2,
  Scissors,
  Users,
  Building2,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

const heroImages = [
  "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80", // podcast mic
  "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80", // headphones
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80", // african musician
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", // recording studio
  "https://images.unsplash.com/photo-1520532223790-8fe96829ee20?w=800&q=80", // african woman speaking
  "https://images.unsplash.com/photo-1581368135153-a506cf13b1e1?w=800&q=80", // mic with light
];

const partnerLogos = [
  "Spotify", "YouTube", "Apple Podcasts", "Audiomack", "Anchor", "Google Podcasts",
];

const problems = [
  {
    icon: Target,
    title: "Lack of Strategy",
    bullets: ["No clear audience definition", "Weak content positioning", "No long-term growth plan"],
  },
  {
    icon: EyeOff,
    title: "Limited Visibility",
    bullets: ["Fragmented presence across platforms", "Low discoverability", "No centralized amplification"],
  },
  {
    icon: Wallet,
    title: "Weak Monetization",
    bullets: ["Over-reliance on ads", "Limited sponsorship access", "No structured revenue systems"],
  },
];

const solutions = [
  { icon: Lightbulb, title: "Strategy & Development", body: "Audience research, positioning, and content roadmap." },
  { icon: Video, title: "High-Quality Production", body: "Studio-grade audio and video, in-house or on location." },
  { icon: Share2, title: "Multi-Platform Distribution", body: "One upload, every platform — managed end-to-end." },
  { icon: Scissors, title: "Content Repurposing", body: "Long-form turned into clips, reels, and articles." },
  { icon: TrendingUp, title: "Growth Systems", body: "Data-driven playbooks for retention and reach." },
  { icon: DollarSign, title: "Monetization Support", body: "Subscriptions, sponsorships, and tipping built-in." },
];

const steps = [
  { n: "01", title: "Plan Your Podcast", body: "We help define your audience, content, and positioning." },
  { n: "02", title: "Produce Content", body: "Professional video and audio production." },
  { n: "03", title: "Distribute Everywhere", body: "Publish across platforms from one system." },
  { n: "04", title: "Grow Your Audience", body: "Use data, clips, and strategies to scale." },
  { n: "05", title: "Monetize", body: "Unlock revenue through structured systems." },
];

const features = [
  { icon: Mic2, title: "Podcast Hosting", body: "Video + audio with smart transcoding." },
  { icon: BarChart3, title: "Unified Analytics", body: "Plays, retention & revenue across every platform." },
  { icon: Share2, title: "Multi-Platform Sync", body: "YouTube, Spotify, Apple — managed in one place." },
  { icon: Sparkles, title: "AI Content Repurposing", body: "Auto-generated clips and captions." },
  { icon: DollarSign, title: "Monetization Tools", body: "Subscriptions, premium episodes, tips." },
  { icon: Globe2, title: "Creator Profiles", body: "Custom channel pages with subscribers." },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* HERO — iKAMBA-inspired collage */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Podcast Hosting & Growth Ecosystem
              </span>
              <h1 className="mt-5 font-display font-bold text-5xl lg:text-7xl leading-[1.02] tracking-tight text-foreground">
                Amplifying{" "}
                <span className="text-accent">African Voices</span>{" "}
                Through Podcasting.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                A complete podcast production, distribution, and growth ecosystem designed for creators, organizations, and brands across Africa.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold text-base h-12 px-7">
                  <Link to="/auth">
                    Get Started <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full font-semibold text-base h-12 px-7 border-border">
                  <Link to="/discover">Explore Podcasts</Link>
                </Button>
              </div>
            </motion.div>

            {/* Photo collage 3x2 with vertical offset on second row */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative grid grid-cols-3 gap-3 lg:gap-4"
            >
              {heroImages.map((src, i) => (
                <div
                  key={src}
                  className={`overflow-hidden rounded-2xl border border-border/60 shadow-soft ${
                    i % 2 === 1 ? "mt-6 lg:mt-10" : ""
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover aspect-[3/4]"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Trusted strip / carousel */}
          <div className="mt-20 lg:mt-28">
            <p className="text-center text-xs uppercase tracking-[0.22em] text-muted-foreground mb-8">
              Distribute everywhere your audience listens
            </p>
            <div className="relative overflow-hidden">
              <div className="flex gap-12 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
                {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((p, i) => (
                  <span key={i} className="text-foreground/70 font-display font-semibold text-xl shrink-0">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS AMPLIFY AFRICA */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">About Amplify Africa</span>
          <h2 className="mt-4 font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
            More Than a <span className="text-accent">Podcast Platform</span>.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Amplify Africa is a media and content infrastructure initiative designed to support African creators, organizations, and thought leaders in building, growing, and monetizing impactful podcasts.
          </p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Powered by <span className="text-accent font-semibold">iKAMBA</span>, Amplify Africa combines production expertise, strategic guidance, and technology to deliver a complete podcast ecosystem.
          </p>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-24 lg:py-32 border-t border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">The Challenge</span>
            <h2 className="mt-4 font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
              The Challenge in <span className="text-accent">African Podcasting</span>.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {problems.map((p) => (
              <div key={p.title} className="rounded-2xl bg-card border border-border/60 p-7">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mb-5">
                  <p.icon className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground mb-4">{p.title}</h3>
                <ul className="space-y-2">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-destructive mt-1">•</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR SOLUTION */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Our Solution</span>
            <h2 className="mt-4 font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
              A Complete <span className="text-accent">Podcast Ecosystem</span>.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {solutions.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl bg-card border border-border/60 p-6 hover:border-accent/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center mb-5">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 5 steps */}
      <section className="py-24 lg:py-32 border-t border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">How It Works</span>
            <h2 className="mt-4 font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
              From idea to audience in <span className="text-accent">five steps</span>.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl bg-card border border-border/60 p-6">
                <span className="font-display font-bold text-4xl text-accent/30">{s.n}</span>
                <h3 className="mt-3 font-display font-bold text-lg text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/how-it-works">See the full journey <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Who It's For</span>
            <h2 className="mt-4 font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
              Built for storytellers <span className="text-accent">and brands</span>.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-3xl bg-card border border-border/60 p-8 lg:p-10">
              <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center mb-5">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-4">Creators & Influencers</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Independent podcasters</li>
                <li>• Media personalities</li>
                <li>• Content creators & influencers</li>
              </ul>
              <Button asChild variant="link" className="mt-4 p-0 text-accent">
                <Link to="/for-creators">For Creators →</Link>
              </Button>
            </div>
            <div className="rounded-3xl bg-card border border-border/60 p-8 lg:p-10">
              <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mb-5">
                <Building2 className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-4">Organizations & Brands</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• NGOs & non-profits</li>
                <li>• Corporate brands</li>
                <li>• Thought leaders & executives</li>
              </ul>
              <Button asChild variant="link" className="mt-4 p-0 text-accent">
                <Link to="/for-organizations">For Organizations →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section id="features" className="py-24 lg:py-32 border-t border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Platform Features</span>
            <h2 className="mt-4 font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
              Everything in <span className="text-accent">one dashboard</span>.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-card border border-border/60 p-6 hover:border-accent/40 transition-colors">
                <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
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
              <Megaphone className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-display font-bold text-4xl lg:text-5xl tracking-tight text-primary">
                Start Building Your Podcast Today.
              </h2>
              <p className="mt-4 text-primary/80 text-lg max-w-xl mx-auto">
                Join the next generation of African podcasters. Free to start, with expert support every step of the way.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold text-base h-12 px-8">
                  <Link to="/auth">Create Account <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full font-semibold text-base h-12 px-8 bg-transparent border-primary/40 text-primary hover:bg-primary/10">
                  <Link to="/contact">Book a Consultation</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
