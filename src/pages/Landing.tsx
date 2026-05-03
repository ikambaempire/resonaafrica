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
  Video,
  Share2,
  Scissors,
  Users,
  Building2,
  Lightbulb,
  Headphones,
  Radio,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { NewReleases } from "@/components/NewReleases";
import heroBg from "@/assets/hero-resona-bg.png";

const partnerLogos = [
  "Spotify", "YouTube", "Apple Podcasts", "Audiomack", "Anchor", "Google Podcasts",
];

const productCards = [
  {
    tag: "Real Studios",
    title: "Production in every African city",
    body: "Work with professional creators across major cities in Africa. Studio-quality podcasts without flying in crews.",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=900&q=80",
    stats: [
      { v: "200+", l: "Creators" },
      { v: "20+", l: "Cities" },
      { v: "48hr", l: "Mobilization" },
    ],
    href: "/services",
  },
  {
    tag: "Real Stories",
    title: "Authentic voices from real people",
    body: "Capture and publish authentic African stories at scale. Fast, consistent, and built for the continent.",
    image: "https://images.unsplash.com/photo-1520532223790-8fe96829ee20?w=900&q=80",
    stats: [
      { v: "500+", l: "Episodes" },
      { v: "30+", l: "Countries" },
      { v: "4x", l: "ROI vs traditional" },
    ],
    href: "/for-creators",
  },
];

const catalog = [
  { tag: "INTERVIEWS", title: "Founder Conversation", price: "From $2,000", img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=700&q=80" },
  { tag: "BRAND PODCAST", title: "Brand Series", price: "From $4,500", img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=80" },
  { tag: "EVENT COVERAGE", title: "On-Location Show", price: "From $3,500", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&q=80" },
  { tag: "AI CLIPS", title: "Social Repurposing", price: "From $500", img: "https://images.unsplash.com/photo-1581368135153-a506cf13b1e1?w=700&q=80" },
  { tag: "CUSTOMER STORIES", title: "Impact Story", price: "From $2,500", img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=700&q=80" },
  { tag: "VIDEO PODCAST", title: "Studio Series", price: "From $3,000", img: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=700&q=80" },
];

const humanCapabilities = ["Interviews", "Live shows", "On-location", "Field reporting", "Brand films", "Documentaries"];
const aiCapabilities = ["Editing", "Voice-over", "Subtitles", "Clip generation", "Upscaling", "Versioning"];

const features = [
  { icon: Mic2, title: "Podcast Hosting", body: "Video + audio with smart transcoding." },
  { icon: BarChart3, title: "Unified Analytics", body: "Plays, retention & revenue across every platform." },
  { icon: Share2, title: "Multi-Platform Sync", body: "YouTube, Spotify, Apple — managed in one place." },
  { icon: Sparkles, title: "AI Repurposing", body: "Auto-generated clips, captions, and shorts." },
  { icon: DollarSign, title: "Monetization", body: "Subscriptions, premium episodes, tips." },
  { icon: Globe2, title: "Creator Channels", body: "Custom pages with subscribers & RSS." },
];

const testimonials = [
  { quote: "Resona Africa gave our show a real continental audience. Production quality is unmatched.", name: "Amara O.", role: "Host, Lagos" },
  { quote: "From idea to publish in two weeks. The team gets African storytelling.", name: "Kwame B.", role: "Producer, Accra" },
  { quote: "We finally have one dashboard for analytics across every platform.", name: "Zainab M.", role: "Brand lead, Nairobi" },
];

// Hero now uses a single background image (no carousel).

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* HERO — full-bleed background image (Resona Talks Africa) */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${heroBg})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/30 lg:from-background/90 lg:via-background/50 lg:to-transparent" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-28 min-h-[640px] lg:min-h-[760px] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-4">By iKAMBA</span>
            <h1 className="font-display font-bold text-5xl lg:text-7xl xl:text-[88px] leading-[0.98] tracking-tight text-foreground">
              The African<br />
              <span className="text-accent">podcast</span> platform
            </h1>
            <p className="mt-7 text-lg lg:text-xl text-foreground/85 max-w-xl leading-relaxed">
              Create, distribute and grow podcasts anywhere in Africa. Choose self-serve creation to launch instantly, or scale your show with our enterprise platform.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold text-base h-12 px-8">
                <Link to="/auth">Get started <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full font-semibold text-base h-12 px-8 border-border/70 backdrop-blur bg-background/30">
                <Link to="/discover">Explore podcasts</Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero stats row */}
          <div className="mt-16 lg:mt-24 grid grid-cols-3 gap-6 max-w-3xl">
            {[
              { v: "500+", l: "Episodes Produced" },
              { v: "30+", l: "African Countries" },
              { v: "200+", l: "Creators" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display font-bold text-4xl lg:text-6xl text-accent">{s.v}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-foreground/70">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW RELEASES */}
      <NewReleases />

      {/* TWO-CARD SOLUTION SUMMARY — 90seconds pattern */}
      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-5">
            <Link to="/for-creators" className="group rounded-3xl bg-card border border-border/60 p-8 lg:p-10 hover:border-accent/50 transition-all">
              <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Self-Serve</span>
              <h3 className="mt-3 font-display font-bold text-2xl lg:text-3xl text-foreground">Self Serve Creation</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">Browse. Order. Match. Launch a professional podcast with the simplicity of e-commerce.</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">Learn more <ArrowRight className="w-4 h-4" /></span>
            </Link>
            <Link to="/for-organizations" className="group rounded-3xl bg-card border border-border/60 p-8 lg:p-10 hover:border-accent/50 transition-all">
              <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Operations Hub</span>
              <h3 className="mt-3 font-display font-bold text-2xl lg:text-3xl text-foreground">Enterprise Platform</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">Enabling Africa's biggest brands and organizations to create high-quality podcasts at scale.</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">Learn more <ArrowRight className="w-4 h-4" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* PARTNER LOGOS MARQUEE */}
      <section className="py-12 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-xs uppercase tracking-[0.22em] text-muted-foreground mb-8">
            Distribute everywhere your audience listens
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-12 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
              {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((p, i) => (
                <span key={i} className="text-foreground/60 font-display font-semibold text-xl shrink-0">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT — "Podcast solutions for every need" */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Product</span>
            <h2 className="mt-3 font-display font-bold text-4xl lg:text-6xl tracking-tight text-foreground max-w-3xl">
              Podcast solutions for <span className="text-accent">every need</span>
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {productCards.map((c) => (
              <Link key={c.title} to={c.href} className="group rounded-3xl overflow-hidden border border-border/60 bg-card hover:border-accent/50 transition-all">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={c.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-7 lg:p-9">
                  <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">{c.tag}</span>
                  <h3 className="mt-2 font-display font-bold text-2xl lg:text-3xl text-foreground">{c.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{c.body}</p>
                  <div className="mt-7 grid grid-cols-3 gap-3 pb-1">
                    {c.stats.map((s) => (
                      <div key={s.l}>
                        <p className="font-display font-bold text-2xl text-foreground">{s.v}</p>
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mt-1">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">Find out more <ArrowRight className="w-4 h-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SELF-SERVE CATALOG GRID — 90seconds product card pattern */}
      <section className="py-24 lg:py-32 border-t border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Self Serve Creation</span>
              <h2 className="mt-3 font-display font-bold text-4xl lg:text-5xl tracking-tight text-foreground">
                Order podcast content like you order anything else.
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl">
                A full catalog with fixed scope, transparent pricing, and guaranteed quality. Browse, configure, checkout.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full self-start lg:self-end">
              <Link to="/services">Find out more <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {catalog.map((c) => (
              <div key={c.title} className="rounded-2xl overflow-hidden border border-border/60 bg-card group hover:border-accent/40 transition-all">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.img} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{c.tag}</span>
                  <h3 className="mt-1 font-display font-bold text-lg text-foreground">{c.title}</h3>
                  <p className="mt-2 text-sm text-accent font-semibold">{c.price}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl">
            {[
              { v: "100+", l: "Podcast Products" },
              { v: "Fixed", l: "Pricing" },
              { v: "100%", l: "Transparent" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display font-bold text-3xl lg:text-4xl text-foreground">{s.v}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HUMAN + AI HYBRID — 90seconds split section */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Hybrid</span>
            <h2 className="mt-3 font-display font-bold text-4xl lg:text-6xl tracking-tight text-foreground">
              Humans capture the story. <span className="text-accent">AI powers everything else.</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              The only African platform where 200+ real-world creators, intelligent production agents, and generative AI work together to deliver podcasts at scale.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* HUMAN */}
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
              <div className="aspect-[16/9] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=900&q=80" alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="p-8 lg:p-10">
                <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">HUMAN</span>
                <h3 className="mt-3 font-display font-bold text-3xl text-foreground">Capture what AI can't</h3>
                <p className="mt-3 text-muted-foreground">Real African stories filmed by professional creators across the continent.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {humanCapabilities.map((c) => (
                    <span key={c} className="px-3 py-1.5 rounded-full bg-secondary text-sm text-foreground border border-border/60">{c}</span>
                  ))}
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div><p className="font-display font-bold text-3xl text-foreground">200+</p><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mt-1">Creators</p></div>
                  <div><p className="font-display font-bold text-3xl text-foreground">30+</p><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mt-1">Countries</p></div>
                </div>
              </div>
            </div>

            {/* AI */}
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
              <div className="aspect-[16/9] overflow-hidden gradient-hero flex items-center justify-center">
                <Sparkles className="w-24 h-24 text-accent/60" />
              </div>
              <div className="p-8 lg:p-10">
                <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">AI</span>
                <h3 className="mt-3 font-display font-bold text-3xl text-foreground">Accelerate everything else</h3>
                <p className="mt-3 text-muted-foreground">AI-assisted workflows that help creators move faster at every stage.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {aiCapabilities.map((c) => (
                    <span key={c} className="px-3 py-1.5 rounded-full bg-secondary text-sm text-foreground border border-border/60">{c}</span>
                  ))}
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div><p className="font-display font-bold text-3xl text-foreground">12</p><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mt-1">AI Services</p></div>
                  <div><p className="font-display font-bold text-3xl text-foreground">3x</p><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mt-1">Faster delivery</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section id="features" className="py-24 lg:py-32 border-t border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Platform</span>
            <h2 className="mt-3 font-display font-bold text-4xl lg:text-6xl tracking-tight text-foreground">
              Everything in <span className="text-accent">one dashboard</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-card border border-border/60 p-7 hover:border-accent/40 transition-colors">
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

      {/* WHO IT'S FOR */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Who It's For</span>
            <h2 className="mt-3 font-display font-bold text-4xl lg:text-6xl tracking-tight text-foreground">
              Built for storytellers <span className="text-accent">and brands</span>
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

      {/* TESTIMONIALS */}
      <section className="py-24 lg:py-32 border-t border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Testimonials</span>
            <h2 className="mt-3 font-display font-bold text-4xl lg:text-6xl tracking-tight text-foreground">
              Loved by African <span className="text-accent">storytellers</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl bg-card border border-border/60 p-7">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-accent text-accent" />)}
                </div>
                <p className="text-foreground leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 pt-5 border-t border-border/60">
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-3xl gradient-gold p-12 lg:p-20 text-center overflow-hidden shadow-gold">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
            </div>
            <div className="relative">
              <Radio className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-display font-bold text-4xl lg:text-6xl tracking-tight text-primary">
                Start your podcast today.
              </h2>
              <p className="mt-5 text-primary/80 text-lg max-w-xl mx-auto">
                Join the next generation of African podcasters. Free to start, with expert support every step of the way.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold text-base h-12 px-8">
                  <Link to="/auth">Create account <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full font-semibold text-base h-12 px-8 bg-transparent border-primary/40 text-primary hover:bg-primary/10">
                  <Link to="/contact">Book a consultation</Link>
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
