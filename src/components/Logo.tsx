import logoFull from "@/assets/resona-logo-full.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showPoweredBy?: boolean;
}

const sizes = {
  sm: { img: "h-8", powered: "text-[9px]" },
  md: { img: "h-10", powered: "text-[10px]" },
  lg: { img: "h-14", powered: "text-xs" },
};

export function Logo({ size = "md", className = "", showPoweredBy = false }: LogoProps) {
  const s = sizes[size];
  return (
    <span className={`inline-flex flex-col items-start leading-none ${className}`}>
      <img src={logoFull} alt="Resona Africa" className={`${s.img} w-auto object-contain`} />
      {showPoweredBy && (
        <span className={`mt-2 font-medium uppercase tracking-[0.18em] text-muted-foreground ${s.powered}`}>
          Powered by <span className="normal-case">iKAMBA</span>
        </span>
      )}
    </span>
  );
}
