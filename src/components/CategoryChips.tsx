import { Link, useSearchParams } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

export function CategoryChips() {
  const { data: categories = [] } = useCategories();
  const [params] = useSearchParams();
  const active = params.get("category");
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin">
      <Chip to="/discover" label="All" active={!active} />
      {categories.map((c) => (
        <Chip key={c.slug} to={`/discover?category=${c.slug}`} label={`${c.emoji ?? ""} ${c.name}`.trim()} active={active === c.slug} />
      ))}
    </div>
  );
}

function Chip({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active ? "bg-foreground text-background" : "bg-secondary/60 text-foreground hover:bg-secondary"
      }`}
    >
      {label}
    </Link>
  );
}
