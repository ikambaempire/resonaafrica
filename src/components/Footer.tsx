import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The operating system for African podcast creators. Host, grow, and monetize — all in one place.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/discover" className="hover:text-foreground">Discover</Link></li>
              <li><Link to="/auth" className="hover:text-foreground">Creator dashboard</Link></li>
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">How it works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Contact</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-8 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Amplify Africa. All rights reserved.
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Powered by <span className="text-accent font-semibold">iKAMBA</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
