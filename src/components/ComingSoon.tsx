import { Card } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display font-bold text-3xl lg:text-4xl text-foreground tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </header>
      <Card className="rounded-2xl border-border/60 p-12 text-center bg-card/60">
        <div className="w-16 h-16 mx-auto rounded-2xl gradient-gold flex items-center justify-center mb-5">
          {icon}
        </div>
        <h2 className="font-display font-bold text-2xl text-foreground">Coming soon</h2>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          We're putting the finishing touches on this. It will be available in the next phase of the rollout.
        </p>
      </Card>
    </div>
  );
}
