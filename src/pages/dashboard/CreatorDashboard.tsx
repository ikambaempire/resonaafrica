import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic2, Play, TrendingUp, Users, DollarSign, Eye, ArrowUpRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total plays", value: "248,392", change: "+18%", icon: Play },
  { label: "Subscribers", value: "12,408", change: "+24%", icon: Users },
  { label: "Watch time (hrs)", value: "8,214", change: "+12%", icon: Eye },
  { label: "Revenue (this mo.)", value: "$3,248", change: "+31%", icon: DollarSign },
];

const recentEpisodes = [
  { title: "Building in Lagos — with Tomi Davies", plays: "12,402", date: "Yesterday", duration: "47:12" },
  { title: "Why African fintech is winning", plays: "8,914", date: "3 days ago", duration: "52:08" },
  { title: "The creator economy in Kenya", plays: "6,250", date: "1 week ago", duration: "38:24" },
];

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const firstName = (profile?.full_name || user?.email || "Creator").split(" ")[0].split("@")[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-foreground tracking-tight">
            {firstName} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Here's how your podcast is performing today.</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold">
          <Link to="/dashboard/content"><Plus className="w-4 h-4 mr-1" /> New episode</Link>
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl border-border/60 bg-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-accent" />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-success">
                <TrendingUp className="w-3 h-3" /> {s.change}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Two-column */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent episodes */}
        <Card className="lg:col-span-2 rounded-2xl border-border/60 bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-foreground">Recent episodes</h2>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to="/dashboard/content">View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recentEpisodes.map((ep) => (
              <div key={ep.title} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/60 transition-colors">
                <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center shrink-0">
                  <Mic2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{ep.title}</p>
                  <p className="text-xs text-muted-foreground">{ep.date} · {ep.duration} · {ep.plays} plays</p>
                </div>
                <button className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
                  <Play className="w-3.5 h-3.5 text-primary fill-primary ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="rounded-2xl border-border/60 bg-card p-6">
          <h2 className="font-display font-bold text-xl text-foreground mb-5">Quick actions</h2>
          <div className="space-y-2">
            {[
              { label: "Upload new episode", to: "/dashboard/content", icon: Plus },
              { label: "View analytics", to: "/dashboard/analytics", icon: TrendingUp },
              { label: "Generate AI clips", to: "/dashboard/ai-clips", icon: Mic2 },
              { label: "Manage monetization", to: "/dashboard/monetization", icon: DollarSign },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <a.icon className="w-4 h-4 text-accent" />
                </div>
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
