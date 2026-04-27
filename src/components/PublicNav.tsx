import { Link } from "react-router-dom";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X } from "lucide-react";

const solutions = [
  { to: "/for-creators", label: "For Creators" },
  { to: "/for-organizations", label: "For Organizations" },
  { to: "/services", label: "Services" },
  { to: "/partnerships", label: "Partnerships" },
];

export function PublicNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="shrink-0">
          <Logo size="md" />
        </Link>

        <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-2 rounded-full hover:text-foreground transition-colors flex items-center gap-1 outline-none">
              Solutions <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {solutions.map((s) => (
                <DropdownMenuItem key={s.to} asChild>
                  <Link to={s.to}>{s.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/how-it-works" className="px-3 py-2 hover:text-foreground transition-colors">How It Works</Link>
          <Link to="/roadmap" className="px-3 py-2 hover:text-foreground transition-colors">Roadmap</Link>
          <Link to="/discover" className="px-3 py-2 hover:text-foreground transition-colors">Discover</Link>
          <Link to="/about" className="px-3 py-2 hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="px-3 py-2 hover:text-foreground transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold">
              <Link to="/dashboard/overview">Dashboard</Link>
            </Button>
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
              { to: "/roadmap", label: "Roadmap" },
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
