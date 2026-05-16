import { useEffect, useRef, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
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
  Users,
  User as UserIcon,
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

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
      .then(({ data }) => setUsername((data as any)?.username ?? null));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="h-16 flex items-center px-6 gap-4 border-b border-border/40 backdrop-blur-xl bg-background/80 sticky top-0 z-30">
        <Link to="/" className="mr-6 shrink-0" aria-label="Resona Africa home">
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
          {/* Email intentionally hidden — visible on profile page */}
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link to={username ? `/u/${username}` : "/onboarding"} aria-label="View my profile">
              <UserIcon className="w-4 h-4" />
              <span className="ml-1.5 hidden sm:inline">{username ? "My profile" : "Set up profile"}</span>
            </Link>
          </Button>
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
