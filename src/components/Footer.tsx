import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { NewsletterSignup } from "@/components/NewsletterSignup";

const groups = [
  {
    title: "Platform",
    links: [
      { to: "/discover", label: "Discover" },
      { to: "/auth", label: "Creator Dashboard" },
      { to: "/how-it-works", label: "How It Works" },
      { to: "/roadmap", label: "Roadmap" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { to: "/for-creators", label: "For Creators" },
      { to: "/for-organizations", label: "For Organizations" },
      { to: "/services", label: "Services" },
      { to: "/partnerships", label: "Partnerships" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              The complete podcast production, distribution, and growth ecosystem for African creators and organizations.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{g.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-8 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Resona Africa. All rights reserved.
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Powered by <span className="text-accent font-semibold normal-case">iKAMBA</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
