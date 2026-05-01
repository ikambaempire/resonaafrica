import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Waveform } from "./Waveform";

interface Props {
  src: string;
  title: string;
  poster?: string;
  onProgress?: (seconds: number) => void;
  onPlay?: () => void;
}

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, title, poster, onProgress, onPlay }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const lastReport = useRef(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setTime(a.currentTime);
      if (a.currentTime - lastReport.current >= 15) {
        lastReport.current = a.currentTime;
        onProgress?.(a.currentTime);
      }
    };
    const onMeta = () => setDuration(a.duration);
    const onEnded = () => { setPlaying(false); onProgress?.(a.currentTime); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnded);
    };
  }, [onProgress]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play();
      setPlaying(true);
      onPlay?.();
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
      <audio ref={audioRef} src={src} preload="metadata" />
      {poster ? (
        <img src={poster} alt="" className="w-16 h-16 rounded-xl object-cover" />
      ) : (
        <div className="w-16 h-16 rounded-xl gradient-gold" />
      )}
      <button
        onClick={toggle}
        className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="w-5 h-5 text-primary" /> : <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{title}</p>
        <Waveform bars={40} active={playing} className="my-1" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{fmt(time)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
      <Volume2 className="w-4 h-4 text-muted-foreground hidden sm:block" />
    </div>
  );
}
