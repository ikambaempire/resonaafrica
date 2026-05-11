import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Play, Clock, TrendingUp, Youtube } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export function ChannelStats({ podcastId, episodeCount }: { podcastId: string; episodeCount: number }) {
  const { data } = useQuery({
    queryKey: ["channel-stats", podcastId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("podcast_public_stats", { _podcast_id: podcastId });
      if (error) throw error;
      const rows = (data || []) as { total_plays: number; total_seconds: number; day: string | null; day_plays: number | null }[];
      const totalPlays = rows[0]?.total_plays ?? 0;
      const totalSeconds = rows[0]?.total_seconds ?? 0;
      const map = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        map.set(d.toISOString().slice(0, 10), 0);
      }
      rows.forEach((r) => { if (r.day) map.set(r.day, (map.get(r.day) || 0) + Number(r.day_plays || 0)); });
      const series = Array.from(map.entries()).map(([d, plays]) => ({ date: d.slice(5), plays }));

      const { data: ytRows } = await supabase
        .from("episodes")
        .select("id, title, youtube_views, youtube_views_synced_at")
        .eq("podcast_id", podcastId)
        .not("youtube_video_id", "is", null)
        .order("youtube_views", { ascending: false });
      const ytList = (ytRows || []) as { id: string; title: string; youtube_views: number | null; youtube_views_synced_at: string | null }[];
      const youtubeViews = ytList.reduce((acc, r) => acc + Number(r.youtube_views || 0), 0);
      const lastSyncedAt = ytList
        .map((r) => r.youtube_views_synced_at)
        .filter(Boolean)
        .sort()
        .pop() || null;

      return { totalPlays: Number(totalPlays), totalSeconds: Number(totalSeconds), youtubeViews, ytList, lastSyncedAt, series };
    },
  });

  if (!data) return null;
  const hours = Math.round(data.totalSeconds / 3600);

  return (
    <section className="px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-4">
        <h2 className="font-display font-bold text-2xl">Channel insights</h2>
        <span className="text-xs text-muted-foreground">Last 30 days</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card className="p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3"><Play className="w-5 h-5 text-accent" /></div>
          <p className="text-2xl font-display font-bold"><AnimatedCounter value={data.totalPlays} /></p>
          <p className="text-xs text-muted-foreground mt-1">Resona views</p>
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-3"><Youtube className="w-5 h-5 text-red-500" /></div>
          <p className="text-2xl font-display font-bold"><AnimatedCounter value={data.youtubeViews} /></p>
          <p className="text-xs text-muted-foreground mt-1">YouTube views</p>
          {data.lastSyncedAt && (
            <p className="text-[10px] text-muted-foreground mt-1">Synced {new Date(data.lastSyncedAt).toLocaleString()}</p>
          )}
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3"><Clock className="w-5 h-5 text-accent" /></div>
          <p className="text-2xl font-display font-bold"><AnimatedCounter value={hours} /></p>
          <p className="text-xs text-muted-foreground mt-1">Hours listened</p>
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5 text-accent" /></div>
          <p className="text-2xl font-display font-bold"><AnimatedCounter value={episodeCount} /></p>
          <p className="text-xs text-muted-foreground mt-1">Episodes published</p>
        </Card>
      </div>
      <Card className="p-6 rounded-2xl">
        <ChartContainer config={{ plays: { label: "Views", color: "hsl(var(--accent))" } }} className="h-56 w-full">
          <ResponsiveContainer>
            <AreaChart data={data.series}>
              <defs>
                <linearGradient id="ch-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="plays" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#ch-fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      {data.ytList.length > 0 && (
        <Card className="p-6 rounded-2xl mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-sm">YouTube views breakdown</h3>
            </div>
            {data.lastSyncedAt && (
              <span className="text-[11px] text-muted-foreground">Last synced {new Date(data.lastSyncedAt).toLocaleString()}</span>
            )}
          </div>
          <ul className="divide-y divide-border/60">
            {data.ytList.slice(0, 10).map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2 gap-3">
                <span className="text-sm text-foreground truncate">{e.title}</span>
                <span className="text-sm font-semibold tabular-nums shrink-0">{Number(e.youtube_views || 0).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
