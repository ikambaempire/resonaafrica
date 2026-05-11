import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Youtube, ExternalLink, RefreshCw, Eye, ThumbsUp, MessageSquare, Users, Film } from "lucide-react";
import { toast } from "sonner";

type Stats = {
  channel: { id: string; title: string; thumbnail?: string; customUrl?: string };
  stats: { subscribers: number; views: number; videos: number };
  latest: Array<{ id: string; title: string; thumbnail?: string; views: number; likes: number; comments: number; url: string; publishedAt: string }>;
  fetchedAt: string;
};

const fmt = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" :
  n >= 1_000 ? (n / 1_000).toFixed(1) + "K" : String(n);

export function YouTubeLiveStats() {
  const { user } = useAuth();
  const [savedHandle, setSavedHandle] = useState<string>("");
  const [input, setInput] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("youtube_handle, youtube_channel_id").eq("id", user.id).maybeSingle().then(({ data }) => {
      const h = (data as any)?.youtube_handle || (data as any)?.youtube_channel_id || "";
      setSavedHandle(h);
      setInput(h);
      if (h) refresh(h);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function refresh(handleArg?: string) {
    const q = handleArg ?? input;
    if (!q) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-channel-stats", { body: { input: q } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setStats(data as Stats);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't load YouTube stats");
    } finally { setLoading(false); }
  }

  async function saveAndFetch() {
    if (!user || !input.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-channel-stats", { body: { input: input.trim() } });
      if (error) throw error;
      const s = data as Stats;
      if (!s?.channel?.id) throw new Error("Channel not found");
      await supabase.from("profiles").update({
        youtube_handle: input.trim(),
        youtube_channel_id: s.channel.id,
      } as any).eq("id", user.id);
      setSavedHandle(input.trim());
      setStats(s);
      toast.success(`Connected: ${s.channel.title}`);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't connect channel");
    } finally { setSaving(false); }
  }

  return (
    <Card className="p-6 rounded-2xl border-border/60">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Youtube className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl leading-tight">YouTube live</h2>
            <p className="text-xs text-muted-foreground">Public stats from your channel — refreshed on demand.</p>
          </div>
        </div>
        {stats && (
          <Button variant="ghost" size="sm" onClick={() => refresh()} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span className="ml-1.5">Refresh</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="@yourhandle, channel URL, or UC… channel ID"
          className="rounded-full"
        />
        <Button onClick={saveAndFetch} disabled={saving || !input.trim()} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedHandle ? "Update" : "Connect"}
        </Button>
      </div>

      {loading && !stats && (
        <div className="py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></div>
      )}

      {stats && (
        <>
          <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-secondary/40">
            {stats.channel.thumbnail && <img src={stats.channel.thumbnail} alt="" className="w-12 h-12 rounded-full" />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{stats.channel.title}</p>
              {stats.channel.customUrl && <p className="text-xs text-muted-foreground">{stats.channel.customUrl}</p>}
            </div>
            <a
              href={`https://www.youtube.com/channel/${stats.channel.id}`}
              target="_blank" rel="noreferrer"
              className="text-accent text-sm hover:underline inline-flex items-center"
            >
              Open <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Users, label: "Subscribers", value: stats.stats.subscribers },
              { icon: Eye, label: "Total views", value: stats.stats.views },
              { icon: Film, label: "Videos", value: stats.stats.videos },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-secondary/40 text-center">
                <s.icon className="w-4 h-4 mx-auto mb-1 text-accent" />
                <p className="font-display font-bold text-2xl">{fmt(s.value)}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <h3 className="font-display font-bold text-base mb-2">Latest videos</h3>
          <div className="space-y-2">
            {stats.latest.map((v) => (
              <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/60 transition-colors">
                {v.thumbnail && <img src={v.thumbnail} alt="" className="w-20 h-12 rounded object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{v.title}</p>
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-3">
                    <span className="inline-flex items-center"><Eye className="w-3 h-3 mr-1" />{fmt(v.views)}</span>
                    <span className="inline-flex items-center"><ThumbsUp className="w-3 h-3 mr-1" />{fmt(v.likes)}</span>
                    <span className="inline-flex items-center"><MessageSquare className="w-3 h-3 mr-1" />{fmt(v.comments)}</span>
                  </p>
                </div>
              </a>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground mt-4">
            Updated {new Date(stats.fetchedAt).toLocaleTimeString()}.
          </p>
        </>
      )}
    </Card>
  );
}
