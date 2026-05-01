import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Heart, Lock, ArrowRight } from "lucide-react";
import { useMyPodcasts } from "@/hooks/usePodcasts";
import { Link } from "react-router-dom";

export default function Monetization() {
  const { data: podcasts = [] } = useMyPodcasts();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="font-display font-bold text-3xl lg:text-4xl flex items-center gap-3"><DollarSign className="w-8 h-8 text-accent" /> Monetization</h1>
        <p className="mt-1 text-muted-foreground">Tips, premium episodes, and subscriptions for your podcasts.</p>
      </header>

      <Card className="p-6 rounded-2xl border-accent/30 bg-accent/5">
        <Badge className="mb-3 bg-accent/20 text-accent border-accent/30">Stripe activation required</Badge>
        <h2 className="font-display font-bold text-xl">Connect payments to start earning</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Resona Africa uses Stripe to process tips and subscriptions. Once activated by your workspace owner,
          listeners will see a "Tip" button and be able to subscribe to premium episodes on every channel page.
        </p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3"><Heart className="w-5 h-5 text-accent" /></div>
          <h3 className="font-display font-bold text-lg">Listener tips</h3>
          <p className="text-sm text-muted-foreground mt-1">One-off support from any listener. Default amounts $3 / $5 / $10.</p>
        </Card>
        <Card className="p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3"><Lock className="w-5 h-5 text-accent" /></div>
          <h3 className="font-display font-bold text-lg">Premium episodes</h3>
          <p className="text-sm text-muted-foreground mt-1">Mark any episode as premium — only paid subscribers can listen.</p>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl">
        <h2 className="font-display font-bold text-xl mb-4">Your monetizable podcasts</h2>
        {podcasts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Create a podcast first.</p>
        ) : (
          <div className="space-y-2">
            {podcasts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                <div className="flex-1">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-muted-foreground">/c/{p.slug}</p>
                </div>
                <Button asChild size="sm" variant="outline"><Link to={`/c/${p.slug}`}>Channel <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link></Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
