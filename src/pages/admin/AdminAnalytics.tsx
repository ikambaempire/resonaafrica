import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Loader2, BarChart3, Users, Eye, MousePointerClick, Globe, RefreshCw, Activity } from "lucide-react";

type GAResponse = {
  summary?: any;
  byDay?: any;
  topPages?: any;
  sources?: any;
  countries?: any;
  devices?: any;
  activeNow?: any;
  error?: string;
};

function rows(report: any) {
  return report?.rows || [];
}

export default function AdminAnalytics() {
  const [enabled, setEnabled] = useState(false);

  const { data, isFetching, refetch, error } = useQuery<GAResponse>({
    queryKey: ["admin-ga"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-ga-analytics", { body: {} });
      if (error) {
        const ctx: any = (error as any).context;
        try {
          const body = await ctx?.json?.();
          if (body?.error) throw new Error(body.error);
        } catch (_) { /* ignore */ }
        throw error;
      }
      if (data?.error) throw new Error(data.error);
      return data as GAResponse;
    },
  });

  const m = data?.summary?.rows?.[0]?.metricValues || [];
  const activeUsers = Number(m[0]?.value || 0);
  const newUsers = Number(m[1]?.value || 0);
  const sessions = Number(m[2]?.value || 0);
  const pageviews = Number(m[3]?.value || 0);
  const avgDuration = Number(m[4]?.value || 0);
  const bounceRate = Number(m[5]?.value || 0);
  const realtimeActive = Number(data?.activeNow?.rows?.[0]?.metricValues?.[0]?.value || 0);

  const trend = rows(data?.byDay).map((r: any) => {
    const d = r.dimensionValues?.[0]?.value || "";
    return {
      date: `${d.slice(4, 6)}/${d.slice(6, 8)}`,
      users: Number(r.metricValues?.[0]?.value || 0),
      sessions: Number(r.metricValues?.[1]?.value || 0),
    };
  });

  const cards = [
    { label: "Active users (30d)", value: activeUsers.toLocaleString(), icon: Users },
    { label: "New users", value: newUsers.toLocaleString(), icon: Users },
    { label: "Sessions", value: sessions.toLocaleString(), icon: MousePointerClick },
    { label: "Pageviews", value: pageviews.toLocaleString(), icon: Eye },
    { label: "Avg. session", value: `${Math.round(avgDuration)}s`, icon: Activity },
    { label: "Bounce rate", value: `${(bounceRate * 100).toFixed(1)}%`, icon: BarChart3 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-accent" /> Google Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Live data from your GA4 property — last 30 days.</p>
        </div>
        <div className="flex items-center gap-3">
          {enabled && (
            <span className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {realtimeActive} active now
            </span>
          )}
          <Button
            onClick={() => { setEnabled(true); refetch(); }}
            disabled={isFetching}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {enabled ? "Refresh" : "Load analytics"}
          </Button>
        </div>
      </header>

      {!enabled && (
        <Card className="p-10 rounded-2xl text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Click <span className="text-foreground font-medium">Load analytics</span> to fetch live Google Analytics data.</p>
        </Card>
      )}

      {error && (
        <Card className="p-5 rounded-2xl border-destructive/50">
          <p className="text-sm text-destructive">Error loading GA data: {(error as Error).message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Make sure the service account email is added as a Viewer in GA4 → Admin → Property Access Management,
            and that the Google Analytics Data API is enabled in your Google Cloud project.
          </p>
        </Card>
      )}

      {enabled && data && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {cards.map((c) => (
              <Card key={c.label} className="p-4 rounded-2xl">
                <c.icon className="w-4 h-4 text-accent mb-2" />
                <p className="text-2xl font-display font-bold">{c.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">{c.label}</p>
              </Card>
            ))}
          </div>

          <Card className="p-6 rounded-2xl">
            <h2 className="font-display font-bold text-xl mb-4">Users & sessions — last 30 days</h2>
            <ChartContainer
              config={{
                users: { label: "Users", color: "hsl(var(--accent))" },
                sessions: { label: "Sessions", color: "hsl(var(--primary))" },
              }}
              className="h-72 w-full"
            >
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <ListCard title="Top pages" rows={rows(data.topPages)} valueLabel="views" />
            <ListCard title="Traffic sources" rows={rows(data.sources)} valueLabel="sessions" />
            <ListCard title="Top countries" rows={rows(data.countries)} valueLabel="users" icon={Globe} />
            <ListCard title="Devices" rows={rows(data.devices)} valueLabel="sessions" />
          </div>
        </>
      )}
    </div>
  );
}

function ListCard({ title, rows, valueLabel, icon: Icon }: { title: string; rows: any[]; valueLabel: string; icon?: any }) {
  return (
    <Card className="p-6 rounded-2xl">
      <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-accent" />}
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <div className="space-y-1.5">
          {rows.slice(0, 10).map((r, i) => (
            <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-b border-border/30 last:border-0">
              <span className="flex-1 truncate">{r.dimensionValues?.[0]?.value || "—"}</span>
              <span className="font-mono font-semibold">{Number(r.metricValues?.[0]?.value || 0).toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground uppercase">{valueLabel}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
