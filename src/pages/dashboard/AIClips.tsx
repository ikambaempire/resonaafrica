import { useState, useRef, useEffect } from "react";
import { useMyEpisodes } from "@/hooks/useEpisodes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2, Play, Pause, Clock, Scissors, FileText } from "lucide-react";

interface Clip {
  title: string;
  hook: string;
  start_seconds: number;
  end_seconds: number;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:.*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default function AIClips() {
  const { data: episodes = [] } = useMyEpisodes();
  const [selected, setSelected] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [previewClip, setPreviewClip] = useState<Clip | null>(null);
  const ep = episodes.find((e) => e.id === selected);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => { setPreviewClip(null); }, [selected]);

  const generate = async () => {
    if (!selected) { toast.error("Choose an episode"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-clips", { body: { episodeId: selected } });
      if (error) throw error;
      const result = data as { error?: string; clips?: Clip[] };
      if (result?.error) throw new Error(result.error);
      toast.success(`Generated ${result?.clips?.length ?? 0} clip ideas`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoading(false); }
  };

  const playClip = (c: Clip) => {
    setPreviewClip(c);
    setTimeout(() => {
      if (ep?.hosting === "native" && ep.media_url) {
        const el = ep.media_kind === "video" ? videoRef.current : audioRef.current;
        if (el) {
          el.currentTime = c.start_seconds;
          el.play().catch(() => {});
          const onTime = () => {
            if (el.currentTime >= c.end_seconds) {
              el.pause();
              el.removeEventListener("timeupdate", onTime);
            }
          };
          el.addEventListener("timeupdate", onTime);
        }
      }
    }, 50);
  };

  const clips: Clip[] = Array.isArray(ep?.ai_clips) ? (ep!.ai_clips as unknown as Clip[]) : [];
  const ytId = ep?.hosting === "embed" && ep?.embed_provider === "youtube" && ep.embed_url ? getYouTubeId(ep.embed_url) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="font-display font-bold text-3xl lg:text-4xl flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-accent" /> AI Clips
        </h1>
        <p className="mt-1 text-muted-foreground">Generate a timestamped chapter outline + viral short-clip previews you can play right here.</p>
      </header>

      <Card className="p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Pick an episode" /></SelectTrigger>
            <SelectContent>
              {episodes.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={generate} disabled={!selected || loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Wand2 className="w-4 h-4 mr-1" />} Generate clips
          </Button>
        </div>
        {episodes.length === 0 && <p className="text-sm text-muted-foreground">Create an episode first in Content.</p>}
      </Card>

      {/* Hidden players for native preview */}
      {ep?.hosting === "native" && ep.media_url && (
        ep.media_kind === "video" ? (
          <video ref={videoRef} src={ep.media_url} controls className={previewClip ? "w-full rounded-xl" : "hidden"} />
        ) : (
          <audio ref={audioRef} src={ep.media_url} controls className={previewClip ? "w-full" : "hidden"} />
        )
      )}

      {ep?.transcript && (
        <Card className="p-6 rounded-2xl">
          <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-accent" /> Transcript outline</h2>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">{ep.transcript}</pre>
        </Card>
      )}

      {clips.length > 0 && (
        <Card className="p-6 rounded-2xl">
          <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2"><Scissors className="w-5 h-5 text-accent" /> Suggested clips</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {clips.map((c, i) => {
              const isActive = previewClip === c;
              const dur = Math.max(0, c.end_seconds - c.start_seconds);
              return (
                <div key={i} className={`rounded-xl p-4 space-y-3 border transition-all ${isActive ? "border-accent bg-accent/5" : "border-border bg-secondary/30"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground">{c.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> {Math.round(dur)}s
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.hook}</p>
                  <p className="text-xs text-muted-foreground font-mono">{formatTime(c.start_seconds)} → {formatTime(c.end_seconds)}</p>

                  {ep?.hosting === "native" && ep.media_url ? (
                    <Button size="sm" onClick={() => playClip(c)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      {isActive ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                      {isActive ? "Playing preview" : "Play preview"}
                    </Button>
                  ) : ytId ? (
                    isActive ? (
                      <iframe
                        className="w-full aspect-video rounded-lg"
                        src={`https://www.youtube.com/embed/${ytId}?start=${Math.floor(c.start_seconds)}&end=${Math.floor(c.end_seconds)}&autoplay=1`}
                        allow="autoplay; encrypted-media"
                        title={c.title}
                      />
                    ) : (
                      <Button size="sm" onClick={() => setPreviewClip(c)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Play className="w-3.5 h-3.5 mr-1" /> Play preview
                      </Button>
                    )
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Preview unavailable for this hosting type — timestamps still work in your own editor.</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {!ep?.transcript && clips.length === 0 && selected && !loading && (
        <Card className="p-12 text-center rounded-2xl border-dashed">
          <Sparkles className="w-10 h-10 text-accent mx-auto mb-3" />
          <p className="text-muted-foreground">Click <strong className="text-foreground">Generate clips</strong> to produce a timestamped outline and 4 short-clip ideas.</p>
        </Card>
      )}
    </div>
  );
}
