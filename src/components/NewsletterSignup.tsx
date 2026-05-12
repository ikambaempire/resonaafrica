import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) { toast.error("Enter a valid email"); return; }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers" as any).insert({ email: email.toLowerCase().trim() } as any);
    setLoading(false);
    if (error && !error.message.includes("duplicate")) { toast.error(error.message); return; }
    setEmail("");
    toast.success("You're on the list. Watch your inbox.");
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-md gap-2">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="pl-9 rounded-full bg-secondary border-border/60"
        />
      </div>
      <Button disabled={loading} type="submit" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
      </Button>
    </form>
  );
}
