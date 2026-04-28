import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export function AdminPlaceholder({
  title,
  subtitle,
  icon: Icon,
  metrics,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  metrics: { label: string; value: string }[];
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Admin · {title}</p>
        <h1 className="mt-2 font-display font-bold text-3xl lg:text-4xl text-foreground">{title}</h1>
        <p className="mt-1 text-muted-foreground max-w-2xl">{subtitle}</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="rounded-2xl border-border/60 bg-card p-5">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{m.value}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mt-1">{m.label}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-dashed border-border bg-card/40 p-12 text-center">
        <Icon className="w-10 h-10 mx-auto text-accent/60 mb-3" />
        <h3 className="font-display font-bold text-lg text-foreground">Detailed module coming online</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          The full {title.toLowerCase()} workflow is part of the next admin release. Core stats above are live.
        </p>
      </Card>
    </div>
  );
}
