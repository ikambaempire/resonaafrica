import { useState, useRef, useEffect, useMemo } from "react";
import { useMyEpisodes } from "@/hooks/useEpisodes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2, Play, Clock, Scissors, FileText, Download, Save, Lightbulb, ExternalLink, AlertTriangle, RefreshCw, Share2, Copy, Link2, MessageCircle } from "lucide-react";
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
type AspectPreset = "9:16" | "1:1" | "16:9";
type ExportSettings = { aspectRatio: AspectPreset; safeArea: boolean };
type SharePlatform = "instagram" | "tiktok" | "whatsapp";

const EXPORT_PRESETS: Record<AspectPreset, { width: number; height: number; label: string; helper: string }> = {
  "9:16": { width: 720, height: 1280, label: "9:16", helper: "Shorts / Reels / TikTok" },
  "1:1": { width: 1080, height: 1080, label: "1:1", helper: "Feeds / square promos" },
  "16:9": { width: 1280, height: 720, label: "16:9", helper: "YouTube / wide posts" },
};

function getAspectCss(aspectRatio: AspectPreset) {
  switch (aspectRatio) {
    case "9:16": return "9 / 16";
    case "1:1": return "1 / 1";
    default: return "16 / 9";
  }
}

function getClipCacheKey(clip: Clip, index: number, exportSettings: ExportSettings) {
  return [
    index,
    clip.start_seconds,
    clip.end_seconds,
    safeName(clip.title),
    exportSettings.aspectRatio,
    exportSettings.safeArea ? "safe" : "full",
  ].join(":");
}

function chooseRecorderMime(kind: "video" | "audio") {
  const preferred = kind === "video"
    ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
    : ["audio/webm;codecs=opus", "audio/webm"];

  return preferred.find((mime) => MediaRecorder.isTypeSupported(mime)) ?? "";
}

function getCropRect(videoWidth: number, videoHeight: number, exportSettings: ExportSettings) {
  const preset = EXPORT_PRESETS[exportSettings.aspectRatio];
  const targetRatio = preset.width / preset.height;
  let cropWidth = videoWidth;
  let cropHeight = cropWidth / targetRatio;

  if (cropHeight > videoHeight) {
    cropHeight = videoHeight;
    cropWidth = cropHeight * targetRatio;
  }

  const zoom = exportSettings.safeArea
    ? exportSettings.aspectRatio === "9:16"
      ? 0.82
      : exportSettings.aspectRatio === "1:1"
        ? 0.88
        : 0.94
    : 1;

  cropWidth = Math.max(2, cropWidth * zoom);
  cropHeight = Math.max(2, cropHeight * zoom);

  return {
    sx: Math.max(0, Math.round((videoWidth - cropWidth) / 2)),
    sy: Math.max(0, Math.round((videoHeight - cropHeight) / 2)),
    sw: Math.min(videoWidth, Math.round(cropWidth)),
    sh: Math.min(videoHeight, Math.round(cropHeight)),
  };
}

async function waitForMediaReady(el: HTMLMediaElement) {
  if (el.readyState >= 1) return;

  await new Promise<void>((resolve, reject) => {
    const onLoaded = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error("Browser couldn't load the source media.")); };
    const cleanup = () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("error", onError);
    };

    el.addEventListener("loadedmetadata", onLoaded, { once: true });
    el.addEventListener("error", onError, { once: true });
  });
}

async function seekToTime(el: HTMLMediaElement, time: number) {
  if (Math.abs(el.currentTime - time) < 0.05) return;

  await new Promise<void>((resolve, reject) => {
    const onSeeked = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error("Could not seek to the selected range.")); };
    const cleanup = () => {
      el.removeEventListener("seeked", onSeeked);
      el.removeEventListener("error", onError);
    };

    el.addEventListener("seeked", onSeeked, { once: true });
    el.addEventListener("error", onError, { once: true });
    el.currentTime = Math.max(0, time);
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
}

/**
 * Audio fallback: cut the clip in real-time using a hidden media element + MediaRecorder.
 */
async function trimWithMediaRecorder(mediaUrl: string, clip: Clip, baseName: string, kind: "video" | "audio"): Promise<RenderedClip> {
  return new Promise<RenderedClip>((resolve, reject) => {
    const el = document.createElement(kind === "video" ? "video" : "audio") as HTMLMediaElement;
    el.crossOrigin = "anonymous";
    el.src = mediaUrl;
    el.muted = kind === "video";
    el.volume = 0;
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
        const mime = chooseRecorderMime(kind);
        if (!mime) throw new Error("This browser can't record media in a supported format.");
        const chunks: BlobPart[] = [];
        const rec = new MediaRecorder(stream, { mimeType: mime });
        rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
        rec.onstop = () => {
          const blob = new Blob(chunks, { type: mime });
          cleanup();
          const ext = mime.includes("mp4") ? "mp4" : mime.includes("audio") ? "webm" : "webm";
          resolve({ blob, filename: `${safeName(baseName)}-${safeName(clip.title)}.${ext}`, mime });
        };

        await seekToTime(el, clip.start_seconds);
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
 * Records only the selected portion from the source video and applies the export crop in-browser.
 */
async function recordVideoClip(
  mediaUrl: string,
  clip: Clip,
  baseName: string,
  exportSettings: ExportSettings,
  onProgress?: (pct: number) => void
): Promise<RenderedClip> {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.src = mediaUrl;
  video.preload = "auto";
  video.playsInline = true;
  // IMPORTANT: do NOT mute — createMediaElementSource will reroute audio
  // to the AudioContext destination so it isn't audible, but a muted element
  // produces a silent stream in Chromium.
  video.muted = false;
  video.volume = 1;

  let raf = 0;
  let recorder: MediaRecorder | null = null;
  let sourceStream: MediaStream | null = null;
  let canvasStream: MediaStream | null = null;
  let audioCtx: AudioContext | null = null;
  let audioDestination: MediaStreamAudioDestinationNode | null = null;
  let mediaSource: MediaElementAudioSourceNode | null = null;

  const cleanup = async () => {
    cancelAnimationFrame(raf);
    try { recorder?.stream.getTracks().forEach((track) => track.stop()); } catch { /* ignore */ }
    try { canvasStream?.getTracks().forEach((track) => track.stop()); } catch { /* ignore */ }
    try { sourceStream?.getTracks().forEach((track) => track.stop()); } catch { /* ignore */ }
    try { mediaSource?.disconnect(); } catch { /* ignore */ }
    try { audioDestination?.disconnect(); } catch { /* ignore */ }
    try { await audioCtx?.close(); } catch { /* ignore */ }
    try { video.pause(); } catch { /* ignore */ }
    video.removeAttribute("src");
    try { video.load(); } catch { /* ignore */ }
  };

  try {
    await waitForMediaReady(video);

    // @ts-expect-error captureStream exists on HTMLMediaElement in modern browsers
    sourceStream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
    if (!sourceStream) throw new Error("This browser doesn't support live clip recording.");

    const preset = EXPORT_PRESETS[exportSettings.aspectRatio];
    const canvas = document.createElement("canvas");
    canvas.width = preset.width;
    canvas.height = preset.height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Could not create a video export canvas.");

    const recorderMime = chooseRecorderMime("video");
    if (!recorderMime) throw new Error("This browser can't record video clips in a supported format.");

    canvasStream = canvas.captureStream(30);
    const exportStream = new MediaStream();
    canvasStream.getVideoTracks().forEach((track) => exportStream.addTrack(track));

    try {
      audioCtx = new AudioContext();
      mediaSource = audioCtx.createMediaElementSource(video);
      audioDestination = audioCtx.createMediaStreamDestination();
      mediaSource.connect(audioDestination);
      audioDestination.stream.getAudioTracks().forEach((track) => exportStream.addTrack(track));
    } catch {
      sourceStream.getAudioTracks().forEach((track) => exportStream.addTrack(track));
    }

    const chunks: BlobPart[] = [];
    recorder = new MediaRecorder(exportStream, { mimeType: recorderMime, videoBitsPerSecond: 8_000_000 });

    const result = await new Promise<RenderedClip>(async (resolve, reject) => {
      recorder!.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder!.onerror = () => reject(new Error("The browser stopped recording the clip."));
      recorder!.onstop = () => {
        const blob = new Blob(chunks, { type: recorderMime });
        if (!blob.size) {
          reject(new Error("The selected range exported as an empty clip. Try a shorter range or a different browser."));
          return;
        }
        const ext = recorderMime.includes("mp4") ? "mp4" : "webm";
        resolve({ blob, filename: `${safeName(baseName)}-${safeName(clip.title)}.${ext}`, mime: recorderMime });
      };

      const draw = () => {
        const { sx, sy, sw, sh } = getCropRect(video.videoWidth || preset.width, video.videoHeight || preset.height, exportSettings);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        raf = requestAnimationFrame(draw);
      };

      await seekToTime(video, clip.start_seconds);
      if (audioCtx) {
        await audioCtx.resume().catch(() => undefined);
      }
      draw();
      recorder!.start(250);
      await video.play();

      // Clamp end against actual media duration to avoid recording past EOF.
      const actualDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : Number.POSITIVE_INFINITY;
      const targetEnd = Math.min(clip.end_seconds, actualDuration);
      const totalLen = Math.max(0.1, targetEnd - clip.start_seconds);
      onProgress?.(0);

      const stopAt = () => {
        const elapsed = Math.max(0, video.currentTime - clip.start_seconds);
        const pct = Math.min(99, (elapsed / totalLen) * 100);
        onProgress?.(pct);
        if (video.currentTime >= targetEnd || video.ended) {
          video.removeEventListener("timeupdate", stopAt);
          cancelAnimationFrame(raf);
          try { video.pause(); } catch { /* ignore */ }
          if (recorder?.state !== "inactive") recorder.stop();
          onProgress?.(100);
        }
      };

      video.addEventListener("timeupdate", stopAt);
    });

    return result;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Could not export this clip.");
  } finally {
    await cleanup();
  }
}

async function transcodeRecordedClip(rendered: RenderedClip, kind: "video" | "audio") {
  const ff = await getFFmpeg();
  const inputExt = rendered.filename.split(".").pop()?.toLowerCase() || (kind === "video" ? "webm" : "m4a");
  const inName = `input.${inputExt}`;
  const outExt = kind === "video" ? "mp4" : "m4a";
  const outName = `output.${outExt}`;

  await ff.writeFile(inName, await fetchFile(rendered.blob));

  try {
    const args = kind === "video"
      ? ["-i", inName, "-c:v", "libx264", "-preset", "ultrafast", "-crf", "26", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", outName]
      : ["-i", inName, "-c:a", "aac", "-b:a", "192k", outName];

    await ff.exec(args);
    const data = await ff.readFile(outName);
    const u8 = data as Uint8Array;
    const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
    const mime = kind === "video" ? "video/mp4" : "audio/mp4";
    return {
      blob: new Blob([buf], { type: mime }),
      filename: rendered.filename.replace(/\.[a-z0-9]+$/i, `.${outExt}`),
      mime,
    } satisfies RenderedClip;
  } finally {
    try { await ff.deleteFile(inName); } catch { /* ignore */ }
    try { await ff.deleteFile(outName); } catch { /* ignore */ }
  }
}

async function trimNativeClip(
  mediaUrl: string,
  clip: Clip,
  baseName: string,
  kind: "video" | "audio",
  exportSettings: ExportSettings
): Promise<RenderedClip> {
  if (!mediaUrl) throw new Error("Episode has no source media URL.");

  try {
    toast.loading("Recording selected range…", { id: "clip-dl" });
    const recorded = kind === "video"
      ? await recordVideoClip(mediaUrl, clip, baseName, exportSettings)
      : await trimWithMediaRecorder(mediaUrl, clip, baseName, kind);

    toast.loading("Optimizing clip for download…", { id: "clip-dl" });

    try {
      const optimized = await transcodeRecordedClip(recorded, kind);
      toast.success("Clip ready", { id: "clip-dl" });
      return optimized;
    } catch {
      toast.success("Clip ready", { id: "clip-dl" });
      return recorded;
    }
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}

function buildShareCopy(platform: SharePlatform, shareText: string, shareUrl?: string) {
  const cleanText = shareText.trim();
  switch (platform) {
    case "instagram":
      return `${cleanText}${shareUrl ? `\n\nWatch the full moment:\n${shareUrl}` : ""}\n\n#ResonaAfrica #PodcastClips #Reels`;
    case "tiktok":
      return `${cleanText}${shareUrl ? `\n\nFull clip: ${shareUrl}` : ""}\n#ResonaAfrica #PodcastTok #AfricanCreators`;
    default:
      return `${cleanText}${shareUrl ? `\n\nWatch here: ${shareUrl}` : "\n\nSending the clip file next."}`;
  }
}

function ShareButtons({ shareText, shareUrl, file }: { shareText: string; shareUrl?: string; file?: File }) {
  const canNativeShare = typeof navigator !== "undefined" && !!(navigator as Navigator & { share?: unknown }).share;
  const canShareFile = canNativeShare && file && (navigator as Navigator & { canShare?: (d: ShareData) => boolean }).canShare?.({ files: [file] });
  const nativeShare = async (platform: SharePlatform) => {
    try {
      const data: ShareData = { title: shareText, text: buildShareCopy(platform, shareText, shareUrl) };
      if (shareUrl) data.url = shareUrl;
      if (canShareFile && file) data.files = [file];
      await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(data);
    } catch { /* user cancelled */ }
  };

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const openPlatform = async (platform: SharePlatform) => {
    const formatted = buildShareCopy(platform, shareText, shareUrl);

    if (platform === "whatsapp" && shareUrl) {
      window.open(`https://wa.me/?text=${encodeURIComponent(formatted)}`, "_blank", "noopener,noreferrer");
      return;
    }

    if (file && canShareFile) {
      await nativeShare(platform);
      return;
    }

    await copyText(formatted, `${platform[0].toUpperCase()}${platform.slice(1)} text`);

    if (file) {
      triggerDownload(file, file.name);
      toast.success("Clip downloaded — upload it in the app that just opened.");
    }

    if (platform === "instagram") {
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      return;
    }

    if (platform === "tiktok") {
      window.open("https://www.tiktok.com/upload", "_blank", "noopener,noreferrer");
      return;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(formatted)}`, "_blank", "noopener,noreferrer");
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
          <DropdownMenuItem onClick={() => nativeShare("whatsapp")}>
            <Share2 className="w-4 h-4 mr-2" /> {canShareFile ? "Share from device…" : "Share link…"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => openPlatform("instagram")}>Instagram / Reels</DropdownMenuItem>
        <DropdownMenuItem onClick={() => openPlatform("tiktok")}>TikTok</DropdownMenuItem>
        <DropdownMenuItem onClick={() => openPlatform("whatsapp")}>
          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyText(buildShareCopy("instagram", shareText, shareUrl), "Instagram caption")}>
          <Copy className="w-4 h-4 mr-2" /> Copy caption
        </DropdownMenuItem>
        {shareUrl && (
          <DropdownMenuItem onClick={() => copyText(shareUrl, "Link")}>
            <Copy className="w-4 h-4 mr-2" /> Copy link
          </DropdownMenuItem>
        )}
        {!shareUrl && file && (
          <div className="px-2 py-1.5 text-[11px] text-muted-foreground border-t mt-1">
            Instagram and TikTok will open with a copied caption. Attach the downloaded file inside the app.
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

// =====================================================================
// ClipEditor — Premiere/Canva-style editor for step 3
// =====================================================================
type Episode = {
  id: string; title: string; hosting?: string | null; media_url?: string | null;
  media_kind?: string | null; embed_provider?: string | null; embed_url?: string | null;
  duration_seconds?: number | null;
};
type RenderedMap = Record<string, RenderedClip>;
type DLError = { index: number; message: string } | null;

function ClipEditor(props: {
  ep: Episode;
  ytId: string | null;
  exportSettings: ExportSettings;
  setExportSettings: React.Dispatch<React.SetStateAction<ExportSettings>>;
  maxDur: number;
  draftClips: Clip[];
  previewIndex: number | null;
  setPreviewIndex: (i: number | null) => void;
  updateClip: (i: number, patch: Partial<Clip>) => void;
  downloadClip: (c: Clip, i: number) => void;
  shareNative: (c: Clip, i: number) => Promise<RenderedClip | null>;
  rendered: RenderedMap;
  downloadingIndex: number | null;
  downloadError: DLError;
  setDownloadError: (e: DLError) => void;
  dirty: boolean;
  saving: boolean;
  saveAll: () => void;
  gotoStep: (n: 1 | 2 | 3) => void;
  onExportSrt: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  audioRef: React.RefObject<HTMLAudioElement>;
  playClip: (i: number) => void;
}) {
  const { ep, ytId, exportSettings, setExportSettings, maxDur, draftClips, previewIndex, setPreviewIndex, updateClip,
    downloadClip, shareNative, rendered, downloadingIndex, downloadError, setDownloadError,
    dirty, saving, saveAll, gotoStep, onExportSrt, videoRef, audioRef, playClip } = props;

  const isNative = ep.hosting === "native" && !!ep.media_url;
  const activeIdx = previewIndex ?? 0;
  const active = draftClips[activeIdx] ?? draftClips[0];
  const activeCacheKey = active ? getClipCacheKey(active, activeIdx, exportSettings) : "";
  const [playhead, setPlayhead] = useState(0);

  // Track playhead from media element
  useEffect(() => {
    const el = (ep.media_kind === "video" ? videoRef.current : audioRef.current) as HTMLMediaElement | null;
    if (!el) return;
    const onT = () => setPlayhead(el.currentTime);
    el.addEventListener("timeupdate", onT);
    return () => el.removeEventListener("timeupdate", onT);
  }, [ep.media_kind, videoRef, audioRef, isNative, activeIdx]);

  const seekTo = (t: number) => {
    const el = (ep.media_kind === "video" ? videoRef.current : audioRef.current) as HTMLMediaElement | null;
    if (el) { el.currentTime = Math.max(0, Math.min(maxDur, t)); }
    setPlayhead(t);
  };

  const onTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - r.left) / r.width;
    seekTo(pct * maxDur);
  };

  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / maxDur) * 100))}%`;

  // Tick marks every ~10% of timeline
  const ticks = Array.from({ length: 11 }, (_, i) => i);

  return (
    <Card className="rounded-2xl overflow-hidden border-border">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap p-3 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-2 min-w-0">
          <Scissors className="w-4 h-4 text-accent shrink-0" />
          <span className="font-display font-bold text-sm truncate">{ep.title}</span>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent">Editor</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button variant="outline" size="sm" onClick={() => gotoStep(2)}>← Re-prompt</Button>
          <Button variant="outline" size="sm" onClick={saveAll} disabled={!dirty || saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />} Save
          </Button>
          <Button variant="outline" size="sm" onClick={onExportSrt}>
            <Download className="w-3.5 h-3.5 mr-1" /> .srt
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-0">
        {/* Left: preview + timeline */}
        <div className="p-4 space-y-3 border-b lg:border-b-0 lg:border-r border-border bg-background">
          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Export frame</p>
                <p className="text-[11px] text-muted-foreground">Choose the crop that matches where this clip will be posted.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ToggleGroup
                  type="single"
                  value={exportSettings.aspectRatio}
                  onValueChange={(value) => {
                    if (!value) return;
                    setExportSettings((prev) => ({ ...prev, aspectRatio: value as AspectPreset }));
                  }}
                  className="justify-start"
                >
                  {(["9:16", "1:1", "16:9"] as AspectPreset[]).map((preset) => (
                    <ToggleGroupItem key={preset} value={preset} aria-label={preset} className="px-3 text-xs">
                      {preset}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={exportSettings.safeArea}
                    onCheckedChange={(checked) => setExportSettings((prev) => ({ ...prev, safeArea: checked }))}
                  />
                  Safe-area crop
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-[11px] text-muted-foreground">
              <span>{EXPORT_PRESETS[exportSettings.aspectRatio].helper}</span>
              <span>{exportSettings.safeArea ? "Center crop tightened for UI-safe framing" : "Full crop from source frame"}</span>
            </div>

            <div
              className="relative mx-auto rounded-xl overflow-hidden bg-black border border-border flex items-center justify-center"
              style={{ aspectRatio: getAspectCss(exportSettings.aspectRatio), maxHeight: "26rem" }}
            >
              {isNative && ep.media_kind === "video" ? (
                <video ref={videoRef} src={ep.media_url!} controls className="w-full h-full object-contain" />
              ) : isNative ? (
                <div className="w-full p-6 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                    <Play className="w-7 h-7 text-accent" />
                  </div>
                  <audio ref={audioRef} src={ep.media_url!} controls className="w-full max-w-md" />
                </div>
              ) : ytId ? (
                <iframe
                  key={`${ytId}-${active?.start_seconds}-${exportSettings.aspectRatio}`}
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${ytId}?start=${Math.floor(active?.start_seconds ?? 0)}&end=${Math.floor(active?.end_seconds ?? 0)}`}
                  allow="autoplay; encrypted-media"
                  title={active?.title ?? "preview"}
                />
              ) : (
                <p className="text-xs text-muted-foreground p-6 text-center">No previewable source for this episode.</p>
              )}

              {exportSettings.safeArea && ep.media_kind === "video" && (
                <div className="pointer-events-none absolute border border-dashed border-accent/80 rounded-lg shadow-gold" style={{ inset: exportSettings.aspectRatio === "9:16" ? "8% 10%" : exportSettings.aspectRatio === "1:1" ? "10%" : "8% 6%" }}>
                  <div className="absolute left-2 top-2 rounded bg-background/70 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                    Safe area
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline ribbon */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>{fmt(playhead)}</span>
              <span className="text-accent">Total {fmt(maxDur)}</span>
            </div>
            <div
              onClick={onTimelineClick}
              className="relative h-14 rounded-lg bg-secondary/60 border border-border cursor-pointer overflow-hidden select-none"
              role="slider"
              aria-label="Episode timeline"
            >
              {/* Tick marks */}
              {ticks.map((i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-border/60" style={{ left: `${i * 10}%` }} />
              ))}
              {/* Clip segments */}
              {draftClips.map((c, i) => {
                const left = (c.start_seconds / maxDur) * 100;
                const width = Math.max(0.5, ((c.end_seconds - c.start_seconds) / maxDur) * 100);
                const isActive = i === activeIdx;
                return (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setPreviewIndex(i); seekTo(c.start_seconds); }}
                    className={`absolute top-1.5 bottom-1.5 rounded-md text-[10px] font-semibold px-1.5 truncate text-left transition-all ${
                      isActive
                        ? "bg-accent text-accent-foreground shadow-gold ring-2 ring-accent z-10"
                        : "bg-accent/30 text-foreground hover:bg-accent/50"
                    }`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`${c.title} • ${fmt(c.start_seconds)}–${fmt(c.end_seconds)}`}
                  >
                    {i + 1}. {c.title}
                  </button>
                );
              })}
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-foreground pointer-events-none z-20"
                style={{ left: pct(playhead) }}
              >
                <div className="absolute -top-0.5 -left-1 w-2.5 h-2.5 rotate-45 bg-foreground" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              {ticks.filter((_, i) => i % 2 === 0).map((i) => (
                <span key={i}>{fmt((i / 10) * maxDur)}</span>
              ))}
            </div>
          </div>

          {/* Trim handles for selected clip */}
          {active && (
            <div className="rounded-xl border border-accent/40 bg-accent/5 p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <Input
                    value={active.title}
                    onChange={(e) => updateClip(activeIdx, { title: e.target.value })}
                    className="font-semibold bg-transparent border-0 px-0 h-7 text-sm focus-visible:ring-0"
                  />
                  <Input
                    value={active.hook}
                    onChange={(e) => updateClip(activeIdx, { hook: e.target.value })}
                    className="text-xs text-muted-foreground bg-transparent border-0 px-0 h-6 focus-visible:ring-0"
                  />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground flex items-center gap-1 shrink-0 font-semibold">
                  <Clock className="w-3 h-3" /> {Math.round(active.end_seconds - active.start_seconds)}s
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
                  <span>In {fmt(active.start_seconds)}</span>
                  <span>Out {fmt(active.end_seconds)}</span>
                </div>
                <Slider
                  value={[active.start_seconds, active.end_seconds]}
                  min={0} max={maxDur} step={1}
                  onValueChange={([s, e]) =>
                    updateClip(activeIdx, {
                      start_seconds: Math.min(s, e - 1),
                      end_seconds: Math.max(e, s + 1),
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="text-[10px] text-muted-foreground">
                    Start (sec)
                    <Input type="number" min={0} max={maxDur} value={Math.floor(active.start_seconds)}
                      onChange={(e) => updateClip(activeIdx, {
                        start_seconds: Math.min(active.end_seconds - 1, Math.max(0, +e.target.value)),
                      })} />
                  </label>
                  <label className="text-[10px] text-muted-foreground">
                    End (sec)
                    <Input type="number" min={0} max={maxDur} value={Math.floor(active.end_seconds)}
                      onChange={(e) => updateClip(activeIdx, {
                        end_seconds: Math.max(active.start_seconds + 1, Math.min(maxDur, +e.target.value)),
                      })} />
                  </label>
                </div>
              </div>

              {/* Action row */}
              <div className="flex flex-wrap gap-2">
                {isNative ? (
                  <Button size="sm" onClick={() => playClip(activeIdx)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Play className="w-3.5 h-3.5 mr-1" /> Preview
                  </Button>
                ) : ytId ? (
                  <Button size="sm" onClick={() => setPreviewIndex(activeIdx)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Play className="w-3.5 h-3.5 mr-1" /> Preview
                  </Button>
                ) : null}

                {isNative ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => downloadClip(active, activeIdx)} disabled={downloadingIndex === activeIdx}>
                      {downloadingIndex === activeIdx
                        ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Preparing…</>
                        : <><Download className="w-3.5 h-3.5 mr-1" /> Download</>}
                    </Button>
                    {rendered[activeCacheKey] ? (
                      <ShareButtons
                        shareText={`${active.title} — ${active.hook}`}
                        file={new File([rendered[activeCacheKey].blob], rendered[activeCacheKey].filename, { type: rendered[activeCacheKey].mime })}
                      />
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => shareNative(active, activeIdx)} disabled={downloadingIndex === activeIdx}>
                        {downloadingIndex === activeIdx
                          ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                          : <Share2 className="w-3.5 h-3.5 mr-1" />} Prepare to share
                      </Button>
                    )}
                  </>
                ) : ytId ? (
                  <>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`https://youtu.be/${ytId}?t=${Math.floor(active.start_seconds)}`} target="_blank" rel="noreferrer">
                        <Link2 className="w-3.5 h-3.5 mr-1" /> Open at timestamp
                      </a>
                    </Button>
                    <ShareButtons
                      shareText={`${active.title} — ${active.hook}`}
                      shareUrl={`https://youtu.be/${ytId}?t=${Math.floor(active.start_seconds)}`}
                    />
                  </>
                ) : null}
              </div>

              {downloadError?.index === activeIdx && (
                <Alert variant="destructive" className="mt-1">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertTitle>Couldn't download this clip</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p className="text-sm">Try these checks, then hit Retry:</p>
                    <ul className="list-disc pl-5 text-xs space-y-1">
                      <li>Check your internet connection.</li>
                      <li>Disable ad-blockers or privacy extensions for this site.</li>
                      <li>If the source file was deleted, re-upload it under <strong>Content → Upload from device</strong>.</li>
                      <li>Try Chrome or Edge (best FFmpeg support).</li>
                    </ul>
                    <details className="text-[11px] opacity-80">
                      <summary className="cursor-pointer">Technical details</summary>
                      <code className="block mt-1 break-all">{downloadError.message}</code>
                    </details>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => downloadClip(active, activeIdx)} disabled={downloadingIndex === activeIdx}
                        className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDownloadError(null)}>Dismiss</Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {ep.hosting === "embed" && (
                <p className="text-[11px] text-muted-foreground">
                  Hosted on {ep.embed_provider ?? "external platform"}. We share a timestamped link instead of an MP4. To produce a downloadable clip, re-upload the source under <strong className="text-foreground">Content → Upload from device</strong>.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: clip list */}
        <div className="bg-secondary/20 lg:max-h-[640px] lg:overflow-y-auto">
          <div className="px-4 py-3 border-b border-border sticky top-0 bg-secondary/80 backdrop-blur z-10">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              {draftClips.length} suggested clips
            </p>
          </div>
          <ul className="divide-y divide-border">
            {draftClips.map((c, i) => {
              const isActive = i === activeIdx;
              const dur = Math.round(c.end_seconds - c.start_seconds);
              return (
                <li key={i}>
                  <button
                    onClick={() => { setPreviewIndex(i); seekTo(c.start_seconds); }}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                      isActive ? "bg-accent/10 border-l-4 border-accent" : "hover:bg-secondary/60 border-l-4 border-transparent"
                    }`}
                  >
                    <span className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                      isActive ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                    }`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{c.hook}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {fmt(c.start_seconds)} – {fmt(c.end_seconds)} · {dur}s
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Card>
  );
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
  const [exportSettings, setExportSettings] = useState<ExportSettings>({ aspectRatio: "9:16", safeArea: true });
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

  // Cache rendered blobs per clip index so Share doesn't re-render
  const [rendered, setRendered] = useState<RenderedMap>({});

  const renderNative = async (c: Clip, index: number): Promise<RenderedClip | null> => {
    if (!ep || ep.hosting !== "native" || !ep.media_url) return null;
    const cacheKey = getClipCacheKey(c, index, exportSettings);
    if (rendered[cacheKey]) return rendered[cacheKey];
    const kind = ep.media_kind === "video" ? "video" : "audio";
    setDownloadingIndex(index);
    setDownloadError(null);
    try {
      const r = await trimNativeClip(ep.media_url, c, ep.title, kind, exportSettings);
      setRendered((prev) => ({ ...prev, [cacheKey]: r }));
      return r;
    } catch (e) {
      const msg = (e as Error)?.message || "Unknown error";
      console.error("[AIClips] render failed:", e);
      setDownloadError({ index, message: msg });
      toast.error("Couldn't prepare this clip — see details below.", { id: "clip-dl", duration: 5000 });
      return null;
    } finally {
      setDownloadingIndex(null);
    }
  };

  const downloadClip = async (c: Clip, index: number) => {
    if (!ep) return;
    if (ep.hosting === "native" && ep.media_url) {
      const r = await renderNative(c, index);
      if (r) triggerDownload(r.blob, r.filename);
    } else {
      const ytId = ep.embed_provider === "youtube" && ep.embed_url ? getYouTubeId(ep.embed_url) : null;
      const link = ytId ? `https://youtu.be/${ytId}?t=${Math.floor(c.start_seconds)}` : ep.embed_url ?? "";
      if (link) window.open(link, "_blank");
    }
  };

  const shareNative = async (c: Clip, index: number) => {
    const r = await renderNative(c, index);
    return r;
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

      {/* STEP 3: Editor (Premiere/Canva style) */}
      {step === 3 && draftClips.length > 0 && (
        <ClipEditor
          ep={ep!}
          ytId={ytId}
          exportSettings={exportSettings}
          setExportSettings={setExportSettings}
          maxDur={maxDur}
          draftClips={draftClips}
          previewIndex={previewIndex}
          setPreviewIndex={setPreviewIndex}
          updateClip={updateClip}
          downloadClip={downloadClip}
          shareNative={shareNative}
          rendered={rendered}
          downloadingIndex={downloadingIndex}
          downloadError={downloadError}
          setDownloadError={setDownloadError}
          dirty={dirty}
          saving={saving}
          saveAll={saveAll}
          gotoStep={setStep}
          onExportSrt={() => downloadSrt(draftClips, ep?.title ?? "clips")}
          videoRef={videoRef}
          audioRef={audioRef}
          playClip={playClip}
        />
      )}

      {step === 3 && ep?.transcript && (
        <Card className="p-6 rounded-2xl">
          <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-accent" /> Transcript outline</h2>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">{ep.transcript}</pre>
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
