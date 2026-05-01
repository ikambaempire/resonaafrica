import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Loader2, BarChart3 } from "lucide-react";

export default function AdminReports() {
  const [stats, setStats] = useState({ podcasts: 0, episodes: 0, plays: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [pc, ec, pl, uc] = await Promise.all([
        supabase.from("podcasts").select("id", { count: "exact", head: true }),
        supabase.from("episodes").select("id", { count: "exact", head: true }),
        supabase.from("episode_plays").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({ podcasts: pc.count || 0, episodes: ec.count || 0, plays: pl.count || 0, users: uc.count || 0 });
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="w-6 h-6 animate-spin mx-auto mt-12" />;

  const cards = [
    { label: "Total users", value: stats.users },
    { label: "Total podcasts", value: stats.podcasts },
    { label: "Total episodes", value: stats.episodes },
    { label: "Total plays", value: stats.plays },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header><h1 className="font-display font-bold text-3xl flex items-center gap-2"><BarChart3 className="w-7 h-7 text-accent" /> Reports</h1></header>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 rounded-2xl">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="text-3xl font-display font-bold mt-2"><AnimatedCounter value={c.value} /></p>
          </Card>
        ))}
      </div>
    </div>
  );
}
