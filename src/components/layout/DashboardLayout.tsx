import { useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Mic2,
  BarChart3,
  DollarSign,
  Calendar,
  Sparkles,
  Puzzle,
  Settings,
  LogOut,
  Bookmark,
  Clock,
} from "lucide-react";

const navItems = [
  { title: "Overview", url: "/dashboard/overview", icon: LayoutDashboard },
  { title: "Content", url: "/dashboard/content", icon: Mic2 },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Scheduler", url: "/dashboard/scheduler", icon: Calendar },
  { title: "AI Clips", url: "/dashboard/ai-clips", icon: Sparkles },
  { title: "Monetization", url: "/dashboard/monetization", icon: DollarSign },
  { title: "Bookmarks", url: "/dashboard/bookmarks", icon: Bookmark },
  { title: "Watch later", url: "/dashboard/watch-later", icon: Clock },
  { title: "Integrations", url: "/dashboard/integrations", icon: Puzzle },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="h-16 flex items-center px-6 gap-4 border-b border-border/40 backdrop-blur-xl bg-background/80 sticky top-0 z-30">
        <Link to="/dashboard/overview" className="mr-6 shrink-0">
          <Logo size="sm" />
        </Link>
        <div className="flex-1 flex items-center h-full overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-full transition-colors hover:text-foreground hover:bg-secondary whitespace-nowrap"
                activeClassName="bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {user && (
            <span className="text-xs text-muted-foreground hidden lg:block truncate max-w-[160px]">{user.email}</span>
          )}
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main ref={mainRef} className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
