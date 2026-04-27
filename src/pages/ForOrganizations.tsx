import { PageShell, PageHero } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Megaphone, MessageCircle, Building2 } from "lucide-react";

const benefits = [
  { icon: Trophy, title: "Thought leadership", body: "Position your executives and experts as voices that shape the conversation." },
  { icon: Megaphone, title: "Brand storytelling", body: "Tell your mission, impact, and values in a long-form, high-trust format." },
  { icon: MessageCircle, title: "Audience engagement", body: "Deepen relationships with customers, donors, and stakeholders." },
  { icon: Building2, title: "Internal & external comms", body: "All-hands, partner updates, and external campaigns in one production line." },
];

export default function ForOrganizations() {
  return (
    <PageShell>
      <PageHero
        eyebrow="For Organizations"
        title={<>Podcasting for <span className="text-accent">brands & NGOs</span>.</>}
        subtitle="A turnkey podcast operation for organizations that want to build trust and reach at scale."
        image="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80"
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
              <Link to="/contact">Partner With Us <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
