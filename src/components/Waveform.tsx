interface Props {
  bars?: number;
  className?: string;
  active?: boolean;
}

export function Waveform({ bars = 32, className = "", active = false }: Props) {
  return (
    <div className={`flex items-end gap-[3px] h-10 ${className}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const h = 20 + Math.abs(Math.sin(i * 0.7) * 60) + Math.abs(Math.cos(i * 1.3) * 20);
        return (
          <span
            key={i}
            className="w-[3px] rounded-full bg-accent/70"
            style={{
              height: `${Math.min(100, h)}%`,
              animation: active ? `waveform-bounce 1.2s ${i * 0.04}s infinite ease-in-out` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
