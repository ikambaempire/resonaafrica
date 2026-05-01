import { Mic2, Play, BarChart3 } from "lucide-react";
import { Waveform } from "./Waveform";

export function PhoneMockup({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 280 }}>
      <div className="relative rounded-[42px] border-[10px] border-foreground/10 bg-card shadow-2xl overflow-hidden" style={{ aspectRatio: "9/19.5" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground/10 rounded-b-2xl z-10" />
        <div className="h-full w-full p-5 pt-10 flex flex-col gap-4 bg-gradient-to-b from-card via-card to-background">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Mic2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Now playing</p>
              <p className="text-xs font-semibold text-foreground">Resona Africa</p>
            </div>
          </div>
          <div className="rounded-2xl bg-secondary/60 p-4 space-y-3">
            <div className="aspect-square rounded-xl gradient-gold flex items-center justify-center">
              <Mic2 className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground line-clamp-1">Building in Lagos</p>
              <p className="text-[11px] text-muted-foreground">Tomi Davies · 47:12</p>
            </div>
            <Waveform bars={28} active />
            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="w-8 h-8 rounded-full bg-secondary" />
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Play className="w-4 h-4 text-primary fill-primary ml-0.5" />
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary" />
            </div>
          </div>
          <div className="rounded-xl bg-secondary/40 p-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">This week</p>
              <p className="text-xs font-semibold text-foreground">+24% plays</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -inset-8 -z-10 rounded-full bg-accent/20 blur-3xl" />
    </div>
  );
}
