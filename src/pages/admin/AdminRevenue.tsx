import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { DollarSign, Loader2 } from "lucide-react";

export default function AdminRevenue() {
  const [tipsTotal, setTipsTotal] = useState(0);
  const [tipsCount, setTipsCount] = useState(0);
  const [activeSubs, setActiveSubs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: tips } = await supabase.from("tips").select("amount_cents,status");
      const succeeded = (tips || []).filter((t) => t.status === "succeeded");
      setTipsTotal(succeeded.reduce((s, t) => s + (t.amount_cents || 0), 0));
      setTipsCount(succeeded.length);
      const { count } = await supabase.from("premium_subscriptions").select("id", { count: "exact", head: true }).eq("status", "active");
      setActiveSubs(count || 0);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="w-6 h-6 animate-spin mx-auto mt-12" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header><h1 className="font-display font-bold text-3xl flex items-center gap-2"><DollarSign className="w-7 h-7 text-accent" /> Revenue</h1></header>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl"><p className="text-xs uppercase tracking-wider text-muted-foreground">Tips collected</p><p className="text-3xl font-display font-bold mt-2">$<AnimatedCounter value={Math.round(tipsTotal / 100)} /></p></Card>
        <Card className="p-5 rounded-2xl"><p className="text-xs uppercase tracking-wider text-muted-foreground">Tip transactions</p><p className="text-3xl font-display font-bold mt-2"><AnimatedCounter value={tipsCount} /></p></Card>
        <Card className="p-5 rounded-2xl"><p className="text-xs uppercase tracking-wider text-muted-foreground">Active subscribers</p><p className="text-3xl font-display font-bold mt-2"><AnimatedCounter value={activeSubs} /></p></Card>
      </div>
      <Card className="p-6 rounded-2xl border-dashed text-center text-sm text-muted-foreground">Detailed revenue breakdowns will appear here as Stripe transactions roll in.</Card>
    </div>
  );
}
