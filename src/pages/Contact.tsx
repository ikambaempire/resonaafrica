import { useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't send", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Message sent", description: "We'll get back to you within 2 business days." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title={<>Let's build something <span className="text-accent">impactful</span>.</>}
        subtitle="Tell us about your show, brand, or idea. We'll be in touch within two business days."
      />
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl bg-card border border-border/60 p-6">
              <Mail className="w-5 h-5 text-accent mb-3" />
              <h3 className="font-display font-bold text-lg mb-1">Email</h3>
              <a href="mailto:hello@amplify.africa" className="text-muted-foreground hover:text-foreground">
                hello@amplify.africa
              </a>
            </div>
            <div className="rounded-2xl bg-card border border-border/60 p-6">
              <MapPin className="w-5 h-5 text-accent mb-3" />
              <h3 className="font-display font-bold text-lg mb-1">Studios</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pan-African network of partner studios across major cities.
              </p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <form onSubmit={onSubmit} className="rounded-3xl bg-card border border-border/60 p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your podcast, brand, or partnership idea..."
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold h-12 px-8"
              >
                {submitting ? "Sending..." : (<>Send Message <Send className="w-4 h-4 ml-1" /></>)}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
