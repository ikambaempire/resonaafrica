import logoGlyph from "@/assets/resona-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showPoweredBy?: boolean;
}

const sizes = {
  sm: { glyph: "w-9 h-9", text: "text-lg", powered: "text-[9px]" },
  md: { glyph: "w-11 h-11", text: "text-[22px]", powered: "text-[10px]" },
  lg: { glyph: "w-14 h-14", text: "text-3xl", powered: "text-xs" },
};

export function Logo({ size = "md", className = "", showPoweredBy = false }: LogoProps) {
  const s = sizes[size];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src={logoGlyph} alt="Resona Africa" className={`${s.glyph} object-contain`} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-bold text-foreground tracking-tight ${s.text}`}>
          Resona <span className="text-accent">Africa</span>
        </span>
        {showPoweredBy && (
          <span className={`mt-1 font-medium uppercase tracking-[0.18em] text-muted-foreground ${s.powered}`}>
            Powered by <span className="normal-case">iKAMBA</span>
          </span>
        )}
      </span>
    </span>
  );
}
