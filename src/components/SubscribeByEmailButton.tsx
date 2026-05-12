import { useState } from "react";
import { Bell, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function SubscribeByEmailButton({ podcastId, podcastTitle }: { podcastId: string; podcastTitle: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!email || !/.+@.+\..+/.test(email)) { toast.error("Enter a valid email"); return; }
    setLoading(true);
    const { error } = await supabase.from("podcast_subscribers" as any).insert({
      podcast_id: podcastId,
      email: email.toLowerCase().trim(),
      user_id: user?.id ?? null,
    } as any);
    setLoading(false);
    if (error && !error.message.includes("duplicate")) { toast.error(error.message); return; }
    setDone(true);
    toast.success(`You'll get an email when ${podcastTitle} drops a new episode.`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setDone(false); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full"><Bell className="w-4 h-4 mr-2" /> Get new episode alerts</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Subscribe to {podcastTitle}</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-accent" />
            </div>
            <p className="font-semibold">You're subscribed!</p>
            <p className="text-sm text-muted-foreground mt-1">We'll email {email} whenever a new episode drops.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter your email and we'll let you know the moment a new episode goes live.</p>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="you@example.com" />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />} Subscribe
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
