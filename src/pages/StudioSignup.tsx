import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function StudioSignup() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      // already logged in: just grant role and redirect
      (async () => {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "studio_owner" as any } as any);
        navigate("/studio");
      })();
    }
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/studio`,
          data: { full_name: name },
        },
      });
      if (error) throw error;
      const newUser = data.user;
      if (newUser) {
        await supabase.from("user_roles").insert({ user_id: newUser.id, role: "studio_owner" as any } as any);
      }
      toast.success("Account created! Check your email to verify, then sign in.");
      navigate("/auth");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally { setBusy(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1 grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto px-6 py-16 w-full">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" /> List your studio</p>
          <h1 className="font-display font-bold text-4xl lg:text-5xl mt-3">Turn your studio into a booking engine.</h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Resona Africa connects podcast creators with the studios that make them sound great. Publish your space, set your hourly rate, and accept bookings with secure payments.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Publish a public studio page with photos, amenities, and rates.",
              "Accept paid bookings — payouts handled by Resona, you keep 80%.",
              "Manage availability and approve bookings from a dedicated dashboard.",
              "Get discovered by podcasters across Africa.",
            ].map((b) => (
              <li key={b} className="flex gap-2"><Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" /> {b}</li>
            ))}
          </ul>
        </div>

        <Card className="rounded-3xl p-8 border-border/60">
          <h2 className="font-display font-bold text-2xl">Create your studio account</h2>
          <p className="text-sm text-muted-foreground mt-1">Already have one? <a href="/auth" className="text-accent">Sign in</a>.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><Label>Your name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1.5" /></div>
            <Button type="submit" disabled={busy} className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Create studio account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
