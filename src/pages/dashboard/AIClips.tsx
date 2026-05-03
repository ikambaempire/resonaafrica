import { useState, useRef, useEffect, useMemo } from "react";
import { useMyEpisodes } from "@/hooks/useEpisodes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2, Play, Pause, Clock, Scissors, FileText, Download, Save } from "lucide-react";

interface Clip {
  title: string;
  hook: string;
  start_seconds: number;
  end_seconds: number;
}

function fmt(s: number) {
  s = Math.max(0, s);
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:.*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// --- WAV encoder for clipped audio export ---
function encodeWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numCh * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  let p = 0;
  const wstr = (s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(p++, s.charCodeAt(i)); };
  wstr("RIFF"); view.setUint32(p, 36 + dataSize, true); p += 4;
  wstr("WAVE"); wstr("fmt "); view.setUint32(p, 16, true); p += 4;
  view.setUint16(p, 1, true); p += 2; view.setUint16(p, numCh, true); p += 2;
  view.setUint32(p, sampleRate, true); p += 4; view.setUint32(p, byteRate, true); p += 4;
  view.setUint16(p, blockAlign, true); p += 2; view.setUint16(p, bytesPerSample * 8, true); p += 2;
  wstr("data"); view.setUint32(p, dataSize, true); p += 4;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
  for (let i = 0; i < samples; i++) {
    for (let c = 0; c < numCh; c++) {
      let s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      p += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

async function downloadAudioClip(mediaUrl: string, clip: Clip, baseName: string) {
  toast.loading("Preparing audio clip…", { id: "clip-dl" });
  try {
    const res = await fetch(mediaUrl);
    const arr = await res.arrayBuffer();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const decoded = await ctx.decodeAudioData(arr);
    const sr = decoded.sampleRate;
    const start = Math.max(0, Math.floor(clip.start_seconds * sr));
    const end = Math.min(decoded.length, Math.floor(clip.end_seconds * sr));
    const len = Math.max(1, end - start);
    const out = ctx.createBuffer(decoded.numberOfChannels, len, sr);
    for (let c = 0; c < decoded.numberOfChannels; c++) {
      out.copyToChannel(decoded.getChannelData(c).slice(start, end), c, 0);
    }
    const blob = encodeWav(out);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${baseName}-${clip.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.wav`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Audio clip downloaded", { id: "clip-dl" });
  } catch (e) {
    toast.error("Could not slice audio: " + (e as Error).message, { id: "clip-dl" });
  }
}

function downloadSrt(clips: Clip[], episodeTitle: string) {
  const toSrtTs = (t: number) => {
    const h = Math.floor(t / 3600).toString().padStart(2, "0");
    const m = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    const ms = Math.floor((t - Math.floor(t)) * 1000).toString().padStart(3, "0");
    return `${h}:${m}:${s},${ms}`;
  };
  const body = clips.map((c, i) => `${i + 1}\n${toSrtTs(c.start_seconds)} --> ${toSrtTs(c.end_seconds)}\n${c.title} — ${c.hook}\n`).join("\n");
  const blob = new Blob([body], { type: "application/x-subrip" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${episodeTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-clips.srt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AIClips() {
  const { data: episodes = [] } = useMyEpisodes();
  const [selected, setSelected] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [draftClips, setDraftClips] = useState<Clip[]>([]);
  const [saving, setSaving] = useState(false);
  const ep = episodes.find((e) => e.id === selected);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const persistedClips: Clip[] = useMemo(
    () => (Array.isArray(ep?.ai_clips) ? (ep!.ai_clips as unknown as Clip[]) : []),
    [ep?.ai_clips]
  );

  useEffect(() => {
    setPreviewIndex(null);
    setDraftClips(persistedClips.map((c) => ({ ...c })));
  }, [selected, persistedClips]);

  const maxDur = Math.max(60, Number(ep?.duration_seconds) || 1800);

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

  const playClip = (i: number) => {
    const c = draftClips[i];
    setPreviewIndex(i);
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

  const updateClip = (i: number, patch: Partial<Clip>) => {
    setDraftClips((prev) => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  };

  const saveAll = async () => {
    if (!ep) return;
    setSaving(true);
    const cleaned = draftClips.map((c) => ({
      ...c,
      start_seconds: Math.max(0, Math.min(maxDur, Math.round(c.start_seconds))),
      end_seconds: Math.max(0, Math.min(maxDur, Math.round(c.end_seconds))),
    })).filter((c) => c.end_seconds > c.start_seconds);
    const { error } = await supabase.from("episodes").update({ ai_clips: cleaned as any }).eq("id", ep.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Clip edits saved");
  };

  const downloadClip = (c: Clip) => {
    if (!ep) return;
    if (ep.hosting === "native" && ep.media_url && ep.media_kind !== "video") {
      downloadAudioClip(ep.media_url, c, ep.title);
    } else if (ep.hosting === "native" && ep.media_url && ep.media_kind === "video") {
      // open trimmed source w/ media fragment hint; let user save raw file
      const a = document.createElement("a");
      a.href = `${ep.media_url}#t=${Math.floor(c.start_seconds)},${Math.floor(c.end_seconds)}`;
      a.download = `${ep.title}-${c.title}.mp4`;
      a.target = "_blank";
      a.click();
      toast.message("Video opened with trim hint — use right-click → Save As. For server-side trimming, attach FFmpeg.");
    } else {
      // Embed: provide a deep-link text file
      const ytId = ep.embed_provider === "youtube" && ep.embed_url ? getYouTubeId(ep.embed_url) : null;
      const link = ytId
        ? `https://www.youtube.com/watch?v=${ytId}&t=${Math.floor(c.start_seconds)}s`
        : ep.embed_url ?? "";
      const txt = `Clip: ${c.title}\nHook: ${c.hook}\nStart: ${fmt(c.start_seconds)}\nEnd: ${fmt(c.end_seconds)}\nLink: ${link}\n`;
      const blob = new Blob([txt], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${ep.title}-${c.title}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  };

  const ytId = ep?.hosting === "embed" && ep?.embed_provider === "youtube" && ep.embed_url ? getYouTubeId(ep.embed_url) : null;
  const dirty = JSON.stringify(draftClips) !== JSON.stringify(persistedClips);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="font-display font-bold text-3xl lg:text-4xl flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-accent" /> AI Clips
        </h1>
        <p className="mt-1 text-muted-foreground">Generate clips, fine-tune their start &amp; end, then download or export.</p>
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
          {draftClips.length > 0 && (
            <>
              <Button variant="outline" onClick={saveAll} disabled={!dirty || saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save edits
              </Button>
              <Button variant="outline" onClick={() => downloadSrt(draftClips, ep?.title ?? "clips")}>
                <Download className="w-4 h-4 mr-1" /> Export .srt
              </Button>
            </>
          )}
        </div>
        {episodes.length === 0 && <p className="text-sm text-muted-foreground">Create an episode first in Content.</p>}
      </Card>

      {ep?.hosting === "native" && ep.media_url && (
        ep.media_kind === "video" ? (
          <video ref={videoRef} src={ep.media_url} controls className={previewIndex !== null ? "w-full rounded-xl" : "hidden"} />
        ) : (
          <audio ref={audioRef} src={ep.media_url} controls className={previewIndex !== null ? "w-full" : "hidden"} />
        )
      )}

      {ep?.transcript && (
        <Card className="p-6 rounded-2xl">
          <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-accent" /> Transcript outline</h2>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">{ep.transcript}</pre>
        </Card>
      )}

      {draftClips.length > 0 && (
        <Card className="p-6 rounded-2xl">
          <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-accent" /> Suggested clips
          </h2>
          <div className="space-y-4">
            {draftClips.map((c, i) => {
              const isActive = previewIndex === i;
              const dur = Math.max(0, c.end_seconds - c.start_seconds);
              return (
                <div key={i} className={`rounded-xl p-5 space-y-4 border transition-all ${isActive ? "border-accent bg-accent/5" : "border-border bg-secondary/30"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Input
                        value={c.title}
                        onChange={(e) => updateClip(i, { title: e.target.value })}
                        className="font-semibold bg-transparent border-0 px-0 h-auto text-base focus-visible:ring-0"
                      />
                      <Input
                        value={c.hook}
                        onChange={(e) => updateClip(i, { hook: e.target.value })}
                        className="mt-1 text-sm text-muted-foreground bg-transparent border-0 px-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> {Math.round(dur)}s
                    </span>
                  </div>

                  {/* Editable timestamps */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                      <span>Start {fmt(c.start_seconds)}</span>
                      <span>End {fmt(c.end_seconds)}</span>
                    </div>
                    <Slider
                      value={[c.start_seconds, c.end_seconds]}
                      min={0}
                      max={maxDur}
                      step={1}
                      onValueChange={([s, e]) => updateClip(i, { start_seconds: Math.min(s, e - 1), end_seconds: Math.max(e, s + 1) })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-muted-foreground">
                        Start (sec)
                        <Input type="number" min={0} max={maxDur} value={Math.floor(c.start_seconds)}
                          onChange={(e) => updateClip(i, { start_seconds: Math.min(c.end_seconds - 1, Math.max(0, +e.target.value)) })} />
                      </label>
                      <label className="text-xs text-muted-foreground">
                        End (sec)
                        <Input type="number" min={0} max={maxDur} value={Math.floor(c.end_seconds)}
                          onChange={(e) => updateClip(i, { end_seconds: Math.max(c.start_seconds + 1, Math.min(maxDur, +e.target.value)) })} />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ep?.hosting === "native" && ep.media_url ? (
                      <Button size="sm" onClick={() => playClip(i)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        {isActive ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                        {isActive ? "Playing" : "Preview"}
                      </Button>
                    ) : ytId ? (
                      <Button size="sm" onClick={() => setPreviewIndex(i)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Play className="w-3.5 h-3.5 mr-1" /> Preview
                      </Button>
                    ) : null}
                    <Button size="sm" variant="outline" onClick={() => downloadClip(c)}>
                      <Download className="w-3.5 h-3.5 mr-1" /> Download clip
                    </Button>
                  </div>

                  {ytId && isActive && (
                    <iframe
                      className="w-full aspect-video rounded-lg"
                      src={`https://www.youtube.com/embed/${ytId}?start=${Math.floor(c.start_seconds)}&end=${Math.floor(c.end_seconds)}&autoplay=1`}
                      allow="autoplay; encrypted-media"
                      title={c.title}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {!ep?.transcript && draftClips.length === 0 && selected && !loading && (
        <Card className="p-12 text-center rounded-2xl border-dashed">
          <Sparkles className="w-10 h-10 text-accent mx-auto mb-3" />
          <p className="text-muted-foreground">Click <strong className="text-foreground">Generate clips</strong> to produce a timestamped outline and short-clip ideas.</p>
        </Card>
      )}
    </div>
  );
}
