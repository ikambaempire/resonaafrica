import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import {
  Loader2, BarChart3, Users, Eye, MousePointerClick, Globe, RefreshCw, Activity, AlertTriangle, ExternalLink,
} from "lucide-react";

type GAResponse = {
  summary?: any;
  byDay?: any;
  topPages?: any;
  sources?: any;
  countries?: any;
  devices?: any;
  activeNow?: any;
  error?: string;
  setupUrl?: string;
};

const rows = (r: any) => r?.rows || [];

export default function AdminAnalytics() {
  // Main report — refresh every 60s
  const main = useQuery<GAResponse>({
    queryKey: ["admin-ga"],
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-ga-analytics", { body: {} });
      if (error) {
        const ctx: any = (error as any).context;
        try {
          const body = await ctx?.json?.();
          if (body?.error) {
            const e: any = new Error(body.error);
            e.setupUrl = body.setupUrl;
            throw e;
          }
        } catch (inner: any) {
          if (inner?.message) throw inner;
        }
        throw error;
      }
      if (data?.error) {
        const e: any = new Error(data.error);
        e.setupUrl = data.setupUrl;
        throw e;
      }
      return data as GAResponse;
    },
    retry: 1,
  });

  // Realtime — poll every 15s (Site Kit-style live counter)
  const live = useQuery<GAResponse>({
    queryKey: ["admin-ga-live"],
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    enabled: !main.error,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-ga-analytics", { body: { realtimeOnly: true } });
      if (error || data?.error) return { activeNow: { rows: [] } };
      return data as GAResponse;
    },
    retry: 0,
  });

  const data = main.data;
  const m = data?.summary?.rows?.[0]?.metricValues || [];
  const activeUsers = Number(m[0]?.value || 0);
  const newUsers = Number(m[1]?.value || 0);
  const sessions = Number(m[2]?.value || 0);
  const pageviews = Number(m[3]?.value || 0);
  const avgDuration = Number(m[4]?.value || 0);
  const bounceRate = Number(m[5]?.value || 0);
  const realtimeActive = Number(
    live.data?.activeNow?.rows?.[0]?.metricValues?.[0]?.value ||
    data?.activeNow?.rows?.[0]?.metricValues?.[0]?.value || 0
  );

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

  const err: any = main.error;
  const isLoading = main.isLoading;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-accent" /> Google Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live data from your GA4 property — auto-refreshes every 60 seconds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!err && (
            <span className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {realtimeActive} active now
            </span>
          )}
          <Button
            onClick={() => { main.refetch(); live.refetch(); }}
            disabled={main.isFetching}
            variant="outline"
            size="sm"
          >
            {main.isFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </header>

      {err && (
        <Card className="p-6 rounded-2xl border-destructive/40 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="font-semibold">Couldn't load Google Analytics</p>
              <p className="text-sm text-muted-foreground break-words">{err.message}</p>
              {err.setupUrl && (
                <a
                  href={err.setupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium"
                >
                  Open Google Cloud to enable the API <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                After enabling, wait ~1 minute then click Refresh. The page will keep retrying automatically.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c, i) => (
          <Card key={c.label} className="p-4 rounded-2xl">
            <c.icon className="w-4 h-4 text-accent mb-2" />
            {isLoading ? (
              <Skeleton className="h-7 w-20 mb-1" />
            ) : (
              <p className="text-2xl font-display font-bold">{err ? "—" : c.value}</p>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">{c.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 rounded-2xl">
        <h2 className="font-display font-bold text-xl mb-4">Users & sessions — last 30 days</h2>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : trend.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
            {err ? "Data unavailable." : "No traffic recorded yet."}
          </div>
        ) : (
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
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <ListCard title="Top pages" rows={rows(data?.topPages)} valueLabel="views" loading={isLoading} />
        <ListCard title="Traffic sources" rows={rows(data?.sources)} valueLabel="sessions" loading={isLoading} />
        <ListCard title="Top countries" rows={rows(data?.countries)} valueLabel="users" icon={Globe} loading={isLoading} />
        <ListCard title="Devices" rows={rows(data?.devices)} valueLabel="sessions" loading={isLoading} />
      </div>
    </div>
  );
}

function ListCard({
  title, rows, valueLabel, icon: Icon, loading,
}: { title: string; rows: any[]; valueLabel: string; icon?: any; loading?: boolean }) {
  return (
    <Card className="p-6 rounded-2xl">
      <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-accent" />}
        {title}
      </h3>
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      ) : rows.length === 0 ? (
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
