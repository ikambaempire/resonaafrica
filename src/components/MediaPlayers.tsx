import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface Props {
  src: string;
  title: string;
  poster?: string;
  onProgress?: (seconds: number) => void;
  onPlay?: () => void;
}

export function VideoPlayer({ src, title, poster, onProgress, onPlay }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      if (v.currentTime - last.current >= 15) {
        last.current = v.currentTime;
        onProgress?.(v.currentTime);
      }
    };
    const onPlayE = () => { setPlaying(true); onPlay?.(); };
    const onPauseE = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlayE);
    v.addEventListener("pause", onPauseE);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlayE);
      v.removeEventListener("pause", onPauseE);
    };
  }, [onProgress, onPlay]);

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-black relative group">
      <video ref={ref} src={src} poster={poster} controls className="w-full aspect-video" aria-label={title} />
      {!playing && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
            <Play className="w-7 h-7 text-primary fill-primary ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}

export function EmbedPlayer({ provider, url, title }: { provider: string | null; url: string; title: string }) {
  let src = url;
  if (provider === "youtube") {
    const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    if (m) src = `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
  } else if (provider === "spotify") {
    const m = url.match(/open\.spotify\.com\/(episode|show|track)\/([\w-]+)/);
    if (m) src = `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
  }
  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <iframe
        src={src}
        title={title}
        className="w-full"
        style={{ aspectRatio: provider === "spotify" ? "16/5" : "16/9", minHeight: 152 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
