import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPodcasts } from "@/hooks/usePodcasts";
import { useMyEpisodes } from "@/hooks/useEpisodes";
import { useCreatorAnalytics } from "@/hooks/useAnalytics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Mic2, Play, TrendingUp, Users, Eye, ArrowUpRight, Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: podcasts = [] } = useMyPodcasts();
  const { data: episodes = [] } = useMyEpisodes();
  const { data: analytics } = useCreatorAnalytics();

  const firstName = (profile?.full_name || user?.email || "Creator").split(" ")[0].split("@")[0];
  const totalPlays = analytics?.totalPlays ?? 0;
  const totalHours = Math.round((analytics?.totalListened ?? 0) / 3600);
  const recent = episodes.slice(0, 4);

  const stats = [
    { label: "Total plays (30d)", value: totalPlays, icon: Play },
    { label: "Hours listened", value: totalHours, icon: Eye },
    { label: "Episodes", value: episodes.length, icon: Mic2 },
    { label: "Podcasts", value: podcasts.length, icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-foreground tracking-tight">{firstName} 👋</h1>
          <p className="mt-1 text-muted-foreground">Here's how your podcasts are performing.</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold">
          <Link to="/dashboard/content"><Plus className="w-4 h-4 mr-1" /> New episode</Link>
        </Button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl border-border/60 bg-card p-5 transition-transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><s.icon className="w-5 h-5 text-accent" /></div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground"><AnimatedCounter value={s.value} /></p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border-border/60 bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl">Recent episodes</h2>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground"><Link to="/dashboard/content">View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Link></Button>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mic2 className="w-10 h-10 mx-auto mb-2 text-accent/60" />
              <p className="text-sm">No episodes yet — head to Content to upload your first.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((ep) => (
                <div key={ep.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/60 transition-colors">
                  <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center shrink-0"><Mic2 className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{ep.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{ep.status} · {ep.hosting}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card p-6">
          <h2 className="font-display font-bold text-xl mb-5">Quick actions</h2>
          <div className="space-y-2">
            {[
              { label: "Upload new episode", to: "/dashboard/content", icon: Plus },
              { label: "View analytics", to: "/dashboard/analytics", icon: TrendingUp },
              { label: "Schedule episodes", to: "/dashboard/scheduler", icon: Clock },
              { label: "Generate AI clips", to: "/dashboard/ai-clips", icon: Mic2 },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center"><a.icon className="w-4 h-4 text-accent" /></div>
                <span className="text-sm font-medium text-foreground flex-1">{a.label}</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
