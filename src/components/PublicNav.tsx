import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { ChevronDown, Menu, X } from "lucide-react";

const solutions = [
  { to: "/for-creators", label: "For Creators" },
  { to: "/for-organizations", label: "For Organizations" },
  { to: "/ecosystem", label: "Ecosystem" },
  { to: "/partnerships", label: "Partnerships" },
];

export function PublicNav() {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);
  const [solOpen, setSolOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSol = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSolOpen(true);
  };
  const closeSol = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setSolOpen(false), 120);
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="shrink-0">
          <Logo size="md" />
        </Link>

        <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <div
            className="relative"
            onMouseEnter={openSol}
            onMouseLeave={closeSol}
          >
            <button
              type="button"
              onFocus={openSol}
              onBlur={closeSol}
              aria-haspopup="true"
              aria-expanded={solOpen}
              className="px-3 py-2 rounded-full hover:text-foreground transition-colors flex items-center gap-1 outline-none"
            >
              Solutions <ChevronDown className={`w-3.5 h-3.5 transition-transform ${solOpen ? "rotate-180" : ""}`} />
            </button>
            {solOpen && (
              <div className="absolute left-0 top-full pt-2 w-56">
                <div className="rounded-xl border border-border/60 bg-popover shadow-xl py-2">
                  {solutions.map((s) => (
                    <Link
                      key={s.to}
                      to={s.to}
                      onClick={() => setSolOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-secondary"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/how-it-works" className="px-3 py-2 hover:text-foreground transition-colors">How It Works</Link>
          <Link to="/services" className="px-3 py-2 hover:text-foreground transition-colors">Services</Link>
          <Link to="/discover" className="px-3 py-2 hover:text-foreground transition-colors">Discover</Link>
          <Link to="/about" className="px-3 py-2 hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="px-3 py-2 hover:text-foreground transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="outline" className="rounded-full font-semibold hidden sm:inline-flex border-accent/50 text-accent hover:bg-accent/10">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold">
                <Link to="/dashboard/overview">Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="rounded-full hidden sm:inline-flex">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold">
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
          <button
            className="lg:hidden p-2 rounded-full hover:bg-secondary"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/40 bg-background">
          <div className="px-6 py-4 flex flex-col gap-1 text-sm">
            {[
              ...solutions,
              { to: "/how-it-works", label: "How It Works" },
              { to: "/ecosystem", label: "Ecosystem" },
              { to: "/discover", label: "Discover" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
