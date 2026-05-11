import { useState, useRef, useEffect, useMemo } from "react";
import { useMyEpisodes } from "@/hooks/useEpisodes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2, Play, Pause, Clock, Scissors, FileText, Download, Save, Lightbulb, ExternalLink, AlertTriangle, RefreshCw, Share2, Copy, Link2, MessageCircle, Twitter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

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


function safeName(s: string) {
  return s.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "");
}

// Singleton ffmpeg instance — loaded on first use
let ffmpegInstance: FFmpeg | null = null;
async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  const ff = new FFmpeg();
  if (onLog) ff.on("log", ({ message }) => onLog(message));
  // Use the CDN-hosted core (UMD build) — no extra config needed.
  const baseURL = "https://unpkg.com/@ffmpeg/[email protected]/dist/umd";
  await ff.load({
    coreURL: `${baseURL}/ffmpeg-core.js`,
    wasmURL: `${baseURL}/ffmpeg-core.wasm`,
  });
  ffmpegInstance = ff;
  return ff;
}

type RenderedClip = { blob: Blob; filename: string; mime: string };

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Fallback: cut the clip in real-time using a hidden <video> + MediaRecorder.
 */
async function trimWithMediaRecorder(mediaUrl: string, clip: Clip, baseName: string, kind: "video" | "audio"): Promise<RenderedClip> {
  return new Promise<RenderedClip>((resolve, reject) => {
    const el = document.createElement(kind === "video" ? "video" : "audio") as HTMLMediaElement;
    el.crossOrigin = "anonymous";
    el.src = mediaUrl;
    el.muted = false;
    (el as HTMLVideoElement).playsInline = true;
    el.preload = "auto";

    const cleanup = () => { try { el.pause(); el.src = ""; el.remove(); } catch { /* */ } };
    const onError = () => { cleanup(); reject(new Error("Browser couldn't load the source media for recording.")); };
    el.addEventListener("error", onError);

    el.addEventListener("loadedmetadata", async () => {
      try {
        // @ts-expect-error captureStream exists on HTMLMediaElement in modern browsers
        const stream: MediaStream = el.captureStream ? el.captureStream() : el.mozCaptureStream();
        if (!stream) throw new Error("This browser doesn't support media capture.");
        const mime = kind === "video"
          ? (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm")
          : (MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm");
        const chunks: BlobPart[] = [];
        const rec = new MediaRecorder(stream, { mimeType: mime });
        rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
        rec.onstop = () => {
          const blob = new Blob(chunks, { type: mime });
          cleanup();
          resolve({ blob, filename: `${safeName(baseName)}-${safeName(clip.title)}.webm`, mime });
        };

        el.currentTime = clip.start_seconds;
        await el.play();
        rec.start();
        const stopAt = () => {
          if (el.currentTime >= clip.end_seconds) {
            el.removeEventListener("timeupdate", stopAt);
            rec.stop();
          }
        };
        el.addEventListener("timeupdate", stopAt);
      } catch (err) { cleanup(); reject(err); }
    }, { once: true });
  });
}

/**
 * Precisely trim a native (CORS-accessible) media URL into a real MP4 / M4A clip.
 * Returns the rendered Blob — caller decides to download or share.
 */
async function trimNativeClip(
  mediaUrl: string,
  clip: Clip,
  baseName: string,
  kind: "video" | "audio"
): Promise<RenderedClip> {
  if (!mediaUrl) throw new Error("Episode has no source media URL.");

  try {
    toast.loading("Loading FFmpeg engine…", { id: "clip-dl" });
    const ff = await getFFmpeg();
    const urlNoQuery = mediaUrl.split("?")[0];
    const inExtMatch = urlNoQuery.match(/\.([a-z0-9]{3,4})$/i);
    const inExt = inExtMatch ? inExtMatch[1].toLowerCase() : (kind === "video" ? "mp4" : "mp3");
    const inName = `input.${inExt}`;
    const outExt = kind === "video" ? "mp4" : "m4a";
    const outName = `clip.${outExt}`;

    toast.loading("Downloading source…", { id: "clip-dl" });
    let fileData: Uint8Array;
    try {
      fileData = await fetchFile(mediaUrl);
    } catch (netErr) {
      const msg = (netErr as Error)?.message || "network";
      throw new Error(`FETCH_FAILED: ${msg}`);
    }
    await ff.writeFile(inName, fileData);

    const start = Math.max(0, clip.start_seconds);
    const dur = Math.max(0.1, clip.end_seconds - clip.start_seconds);

    toast.loading("Cutting clip…", { id: "clip-dl" });
    const args = kind === "video"
      ? ["-ss", String(start), "-i", inName, "-t", String(dur),
         "-c:v", "libx264", "-preset", "ultrafast", "-crf", "26",
         "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", outName]
      : ["-ss", String(start), "-i", inName, "-t", String(dur),
         "-c:a", "aac", "-b:a", "192k", outName];
    await ff.exec(args);

    const data = await ff.readFile(outName);
    const u8 = data as Uint8Array;
    const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
    const mime = kind === "video" ? "video/mp4" : "audio/mp4";
    const blob = new Blob([buf], { type: mime });
    if (blob.size === 0) throw new Error("FFmpeg produced an empty file. Try a different time range.");

    try { await ff.deleteFile(inName); await ff.deleteFile(outName); } catch { /* ignore */ }

    toast.success("Clip ready", { id: "clip-dl" });
    return { blob, filename: `${safeName(baseName)}-${safeName(clip.title)}.${outExt}`, mime };
  } catch (e) {
    const msg = (e as Error)?.message || "";
    if (msg.startsWith("FETCH_FAILED")) {
      try {
        toast.loading(`Recording in real-time (${Math.ceil(clip.end_seconds - clip.start_seconds)}s)…`, { id: "clip-dl" });
        const r = await trimWithMediaRecorder(mediaUrl, clip, baseName, kind);
        toast.success("Clip ready (recorded)", { id: "clip-dl" });
        return r;
      } catch (recErr) {
        throw new Error((recErr as Error)?.message || "Both FFmpeg and recorder fallback failed.");
      }
    }
    throw e instanceof Error ? e : new Error(String(e));
  }
}

function ShareButtons({ shareText, shareUrl, file }: { shareText: string; shareUrl?: string; file?: File }) {
  const canNativeShare = typeof navigator !== "undefined" && !!(navigator as Navigator & { share?: unknown }).share;
  const canShareFile = canNativeShare && file && (navigator as Navigator & { canShare?: (d: ShareData) => boolean }).canShare?.({ files: [file] });
  const wa = `https://wa.me/?text=${encodeURIComponent(shareText + (shareUrl ? ` ${shareUrl}` : ""))}`;
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}${shareUrl ? `&url=${encodeURIComponent(shareUrl)}` : ""}`;

  const nativeShare = async () => {
    try {
      const data: ShareData = { title: shareText, text: shareText };
      if (shareUrl) data.url = shareUrl;
      if (canShareFile && file) data.files = [file];
      await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(data);
    } catch { /* user cancelled */ }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Share2 className="w-3.5 h-3.5 mr-1" /> Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Share this clip</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canNativeShare && (
          <DropdownMenuItem onClick={nativeShare}>
            <Share2 className="w-4 h-4 mr-2" /> {canShareFile ? "Share file…" : "Share via device…"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={tw} target="_blank" rel="noreferrer"><Twitter className="w-4 h-4 mr-2" /> X / Twitter</a>
        </DropdownMenuItem>
        {shareUrl && (
          <DropdownMenuItem onClick={copyLink}>
            <Copy className="w-4 h-4 mr-2" /> Copy link
          </DropdownMenuItem>
        )}
        {!shareUrl && file && (
          <div className="px-2 py-1.5 text-[11px] text-muted-foreground border-t mt-1">
            For TikTok / Instagram: download the file, then upload it from the app.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [draftClips, setDraftClips] = useState<Clip[]>([]);
  const [saving, setSaving] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<{ index: number; message: string } | null>(null);
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
    // If episode already has clips, jump straight to step 3 for review.
    setStep(persistedClips.length > 0 ? 3 : 1);
  }, [selected, persistedClips]);

  const maxDur = Math.max(60, Number(ep?.duration_seconds) || 1800);

  const generate = async () => {
    if (!selected) { toast.error("Choose an episode"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-clips", { body: { episodeId: selected, userPrompt: userPrompt.trim() || undefined } });
      if (error) throw error;
      const result = data as { error?: string; clips?: Clip[] };
      if (result?.error) throw new Error(result.error);
      toast.success(`Generated ${result?.clips?.length ?? 0} clip ideas`);
      setStep(3);
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

  const downloadClip = async (c: Clip, index: number) => {
    if (!ep) return;
    setDownloadError(null);
    if (ep.hosting === "native" && ep.media_url) {
      const kind = ep.media_kind === "video" ? "video" : "audio";
      setDownloadingIndex(index);
      try {
        await trimNativeClip(ep.media_url, c, ep.title, kind);
      } catch (e) {
        const msg = (e as Error)?.message || "Unknown error";
        console.error("[AIClips] download failed:", e);
        setDownloadError({ index, message: msg });
        toast.error("Download failed — see details below the clip.", { id: "clip-dl", duration: 5000 });
      } finally {
        setDownloadingIndex(null);
      }
    } else {
      // Embed (YouTube/Spotify): browsers + platform terms block direct cross-origin downloads.
      const ytId = ep.embed_provider === "youtube" && ep.embed_url ? getYouTubeId(ep.embed_url) : null;
      const link = ytId
        ? `https://www.youtube.com/watch?v=${ytId}&t=${Math.floor(c.start_seconds)}s`
        : ep.embed_url ?? "";
      setDownloadError({
        index,
        message: `This episode is hosted on ${ep.embed_provider ?? "an external platform"}. Direct video downloads aren't possible for embeds. Re-upload the source file under Content → Upload from device to enable MP4 export.`,
      });
      if (link) window.open(link, "_blank");
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

      {/* Stepper indicator */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { n: 1, label: "Choose episode" },
          { n: 2, label: "Tell AI focus" },
          { n: 3, label: "Review & download" },
        ].map((s, i) => {
          const isActive = step === s.n;
          const isDone = step > s.n;
          const reachable = s.n === 1 || (s.n === 2 && !!selected) || (s.n === 3 && draftClips.length > 0);
          return (
            <button
              key={s.n}
              type="button"
              disabled={!reachable}
              onClick={() => reachable && setStep(s.n as 1 | 2 | 3)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                isActive ? "border-accent bg-accent/10 text-foreground" :
                isDone ? "border-accent/40 bg-accent/5 text-accent" :
                "border-border text-muted-foreground"
              } ${reachable ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive || isDone ? "bg-accent text-accent-foreground" : "bg-secondary"
              }`}>{s.n}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: Choose episode */}
      {step === 1 && (
        <Card className="p-6 rounded-2xl space-y-4">
          <div>
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">1</span>
              Pick an episode
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Choose which episode the AI should turn into short clips.</p>
          </div>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger><SelectValue placeholder="Pick an episode" /></SelectTrigger>
            <SelectContent>
              {episodes.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
          {episodes.length === 0 && (
            <p className="text-sm text-muted-foreground">Create an episode first in Content.</p>
          )}
          {ep?.hosting === "embed" && (
            <div className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs text-muted-foreground">
              <ExternalLink className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                This episode is hosted on <strong className="text-foreground capitalize">{ep.embed_provider ?? "an external platform"}</strong>.
                Direct MP4 downloads aren't possible for embedded media. To download trimmed clips, re-upload the source file via <strong className="text-foreground">Content → Upload from device</strong>.
              </span>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!selected} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Next: Tell AI what to focus on →
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Prompt */}
      {step === 2 && (
        <Card className="p-6 rounded-2xl space-y-4">
          <div>
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">2</span>
              What should the AI focus on?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Episode: <strong className="text-foreground">{ep?.title}</strong>. Describe the type of moments you want — or leave blank for general viral picks.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-accent" /> Your focus <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g. Find the most emotional moments where the guest talks about overcoming failure. Or: Pull funny one-liners that work as TikTok hooks."
              rows={4}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                "Funny one-liners that work as TikTok hooks",
                "Emotional storytelling moments",
                "Bold opinions or hot takes",
                "Practical advice / actionable tips",
              ].map((s) => (
                <button key={s} type="button" onClick={() => setUserPrompt(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-accent/60 hover:bg-accent/5 text-muted-foreground hover:text-foreground transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
            <Button onClick={generate} disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Wand2 className="w-4 h-4 mr-1" />} Generate clips
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Review actions header */}
      {step === 3 && draftClips.length > 0 && (
        <Card className="p-6 rounded-2xl space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">3</span>
                Review, edit & download
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Fine-tune timestamps below, then preview or download each clip.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>← Re-prompt</Button>
              <Button variant="outline" size="sm" onClick={saveAll} disabled={!dirty || saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save edits
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadSrt(draftClips, ep?.title ?? "clips")}>
                <Download className="w-4 h-4 mr-1" /> Export .srt
              </Button>
            </div>
          </div>
        </Card>
      )}

      {ep?.hosting === "native" && ep.media_url && (
        <div className={previewIndex !== null ? "flex justify-center" : "hidden"}>
          {ep.media_kind === "video" ? (
            <video
              ref={videoRef}
              src={ep.media_url}
              controls
              className="rounded-xl border border-border bg-black w-full max-w-sm aspect-video"
            />
          ) : (
            <audio ref={audioRef} src={ep.media_url} controls className="w-full max-w-md" />
          )}
        </div>
      )}

      {step === 3 && ep?.transcript && (
        <Card className="p-6 rounded-2xl">
          <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-accent" /> Transcript outline</h2>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">{ep.transcript}</pre>
        </Card>
      )}

      {step === 3 && draftClips.length > 0 && (
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
                    <Button size="sm" variant="outline" onClick={() => downloadClip(c, i)} disabled={downloadingIndex === i}>
                      {downloadingIndex === i ? (
                        <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Preparing…</>
                      ) : (
                        <><Download className="w-3.5 h-3.5 mr-1" /> Download clip</>
                      )}
                    </Button>
                  </div>

                  {downloadError?.index === i && (
                    <Alert variant="destructive" className="mt-1">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertTitle>Couldn't download this clip</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p className="text-sm">Try these quick checks, then hit Retry:</p>
                        <ul className="list-disc pl-5 text-xs space-y-1">
                          <li>Check your internet connection.</li>
                          <li>Disable ad-blockers or privacy extensions for this site.</li>
                          <li>If the source file was deleted, re-upload it under <strong>Content → Upload from device</strong>.</li>
                          <li>Try a different browser (Chrome / Edge work best for FFmpeg).</li>
                        </ul>
                        <details className="text-[11px] opacity-80">
                          <summary className="cursor-pointer">Technical details</summary>
                          <code className="block mt-1 break-all">{downloadError.message}</code>
                        </details>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={() => downloadClip(c, i)} disabled={downloadingIndex === i}
                            className="bg-accent text-accent-foreground hover:bg-accent/90">
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry download
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDownloadError(null)}>Dismiss</Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

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

      {step === 3 && draftClips.length === 0 && (
        <Card className="p-12 text-center rounded-2xl border-dashed">
          <Sparkles className="w-10 h-10 text-accent mx-auto mb-3" />
          <p className="text-muted-foreground">No clips yet. Go back to <strong className="text-foreground">step 2</strong> and generate some.</p>
        </Card>
      )}
    </div>
  );
}
