import { ReactNode } from "react";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  image?: string;
}

export function PageHero({ eyebrow, title, subtitle, image }: PageHeroProps) {
  return (
    <section className="gradient-hero border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className={`grid ${image ? "lg:grid-cols-2 gap-12 items-center" : ""}`}>
          <div>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {eyebrow}
              </span>
            )}
            <h1 className="mt-4 font-display font-bold text-4xl lg:text-6xl leading-[1.05] tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>
            )}
          </div>
          {image && (
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-3xl" />
              <img
                src={image}
                alt=""
                className="relative rounded-3xl object-cover w-full aspect-[4/3] border border-border/60 shadow-soft"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
