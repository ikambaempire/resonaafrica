import { Card } from "@/components/ui/card";
import { Users, Mic2, DollarSign, TrendingUp, Activity, ArrowUpRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const kpis = [
  { label: "Total Revenue", value: "$48,290", change: "+22%", icon: DollarSign },
  { label: "Active Podcasts", value: "184", change: "+8%", icon: Mic2 },
  { label: "Monthly Plays", value: "1.2M", change: "+34%", icon: Play },
  { label: "Avg. Watch Time", value: "27m 14s", change: "+5%", icon: Activity },
];

const recentActivity = [
  { who: "Amara O.", what: "published", target: "Lagos Builders Ep. 12", when: "5m ago" },
  { who: "Kwame B.", what: "upgraded to", target: "Pro plan", when: "22m ago" },
  { who: "Resona Studio", what: "scheduled", target: "Brand series for Equity Bank", when: "1h ago" },
  { who: "Zainab M.", what: "joined as", target: "Creator", when: "3h ago" },
  { who: "System", what: "processed", target: "48 AI clips", when: "5h ago" },
];

export default function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: async () => {
      const [{ count: users }, { count: roles }, { count: podcasts }, { count: episodes }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }),
        supabase.from("podcasts").select("*", { count: "exact", head: true }),
        supabase.from("episodes").select("*", { count: "exact", head: true }),
      ]);
      return { users: users ?? 0, roles: roles ?? 0, podcasts: podcasts ?? 0, episodes: episodes ?? 0 };
    },
  });

  const liveKpis = [
    { label: "Total Accounts", value: stats?.users ?? "…", icon: Users, hint: "Registered users" },
    { label: "Podcasts", value: stats?.podcasts ?? "…", icon: Mic2, hint: "Live shows" },
    { label: "Episodes", value: stats?.episodes ?? "…", icon: Play, hint: "Across the platform" },
    { label: "Role assignments", value: stats?.roles ?? "…", icon: Activity, hint: "Admin / editor / etc." },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Admin Console</p>
        <h1 className="mt-2 font-display font-bold text-4xl lg:text-5xl text-foreground tracking-tight">Platform Overview</h1>
        <p className="mt-2 text-muted-foreground">Real-time signals across the Resona Africa network.</p>
      </header>

      {/* Live KPI cards (real data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {liveKpis.map((s) => (
          <Card key={s.label} className="rounded-2xl border-border/60 bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-[0.14em]">{s.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.hint}</p>
          </Card>
        ))}
      </div>

      {/* Sample / illustrative KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((s) => (
          <Card key={s.label} className="rounded-2xl border-border/60 bg-card/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <s.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-success">
                <TrendingUp className="w-3 h-3" /> {s.change}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground/80">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-[0.14em]">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Recent activity + quick actions */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 rounded-2xl border-border/60 bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-foreground">Recent activity</h2>
            <Link to="/admin/reports" className="text-sm text-accent font-semibold inline-flex items-center gap-1">View all <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          </div>
          <ul className="divide-y divide-border/40">
            {recentActivity.map((a, i) => (
              <li key={i} className="py-3 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-accent">{a.who.split(" ").map(w=>w[0]).join("")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    <span className="font-semibold">{a.who}</span> <span className="text-muted-foreground">{a.what}</span> <span className="font-medium">{a.target}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{a.when}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card p-6">
          <h2 className="font-display font-bold text-xl text-foreground mb-5">Admin actions</h2>
          <div className="space-y-2">
            {[
              { label: "Manage users", to: "/admin/users", icon: Users },
              { label: "Assign roles", to: "/admin/roles", icon: Mic2 },
              { label: "Send announcement", to: "/admin/announcements", icon: TrendingUp },
              { label: "View revenue", to: "/admin/revenue", icon: DollarSign },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-colors">
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
