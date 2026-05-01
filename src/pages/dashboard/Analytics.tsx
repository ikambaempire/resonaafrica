import { useCreatorAnalytics } from "@/hooks/useAnalytics";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Loader2, Play, Clock, TrendingUp } from "lucide-react";

export default function Analytics() {
  const { data, isLoading } = useCreatorAnalytics();

  if (isLoading || !data) {
    return <div className="max-w-7xl mx-auto py-12 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" /></div>;
  }

  const hours = Math.round(data.totalListened / 3600);
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="font-display font-bold text-3xl lg:text-4xl">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Last 30 days across all your podcasts.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3"><Play className="w-5 h-5 text-accent" /></div>
          <p className="text-2xl font-display font-bold"><AnimatedCounter value={data.totalPlays} /></p>
          <p className="text-xs text-muted-foreground mt-1">Total plays</p>
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3"><Clock className="w-5 h-5 text-accent" /></div>
          <p className="text-2xl font-display font-bold"><AnimatedCounter value={hours} /></p>
          <p className="text-xs text-muted-foreground mt-1">Hours listened</p>
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5 text-accent" /></div>
          <p className="text-2xl font-display font-bold"><AnimatedCounter value={data.topEpisodes.length} /></p>
          <p className="text-xs text-muted-foreground mt-1">Episodes with plays</p>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl">
        <h2 className="font-display font-bold text-xl mb-4">Plays — last 30 days</h2>
        <ChartContainer config={{ plays: { label: "Plays", color: "hsl(var(--accent))" } }} className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={data.byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="plays" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      <Card className="p-6 rounded-2xl">
        <h2 className="font-display font-bold text-xl mb-4">Top episodes</h2>
        {data.topEpisodes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No play data yet. Share your channel to start tracking listens.</p>
        ) : (
          <div className="space-y-2">
            {data.topEpisodes.map((e, i) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                <span className="w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <p className="flex-1 truncate font-medium">{e.title}</p>
                <span className="text-sm font-semibold text-foreground">{e.plays.toLocaleString()} plays</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
