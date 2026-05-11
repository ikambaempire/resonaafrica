import { useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Mic2,
  ShieldCheck,
  CreditCard,
  Megaphone,
  FileText,
  Settings,
  LogOut,
  ArrowLeft,
  FolderTree,
  Inbox,
  Network,
  LineChart,
} from "lucide-react";

const navItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Messages", url: "/admin/messages", icon: Inbox },
  { title: "Podcasts", url: "/admin/podcasts", icon: Mic2 },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Roles", url: "/admin/roles", icon: ShieldCheck },
  { title: "Ecosystem", url: "/admin/ecosystem", icon: Network },
  { title: "Revenue", url: "/admin/revenue", icon: CreditCard },
  { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border/40 bg-card/40 backdrop-blur-xl sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-border/40">
          <Link to="/" className="block" aria-label="Resona Africa home">
            <Logo size="sm" />
          </Link>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-accent font-semibold">Admin Console</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.end}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-xl transition-colors hover:text-foreground hover:bg-secondary"
              activeClassName="bg-accent/10 text-accent border border-accent/20"
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-border/40 space-y-2">
          <Link to="/dashboard/overview" className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Creator
          </Link>
          {user && <p className="px-3 text-xs text-muted-foreground truncate">{user.email}</p>}
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-16 flex items-center px-4 gap-3 border-b border-border/40 bg-background sticky top-0 z-30">
          <Link to="/" aria-label="Resona Africa home"><Logo size="sm" /></Link>
          <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">Admin</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="w-4 h-4" /></Button>
        </header>
        <main ref={mainRef} className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
