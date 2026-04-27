import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function PublicNav() {
  const { user } = useAuth();
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="shrink-0">
          <Logo size="md" />
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="/#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <Link to="/discover" className="hover:text-foreground transition-colors">Discover</Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold">
              <Link to="/dashboard/overview">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="rounded-full">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-gold">
                <Link to="/auth">Start free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
