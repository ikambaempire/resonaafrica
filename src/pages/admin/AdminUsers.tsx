import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, UserCircle2, Download, Mail } from "lucide-react";

type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  company: string | null;
  avatar_url: string | null;
  profile_kind: string | null;
  category: string | null;
  website: string | null;
  bio: string | null;
  created_at: string;
  roles: string[];
};

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users-full"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users" as any);
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });

  const filtered = users?.filter((u) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(s) ||
      (u.email || "").toLowerCase().includes(s) ||
      (u.username || "").toLowerCase().includes(s) ||
      (u.company || "").toLowerCase().includes(s)
    );
  });

  const exportCsv = () => {
    if (!filtered?.length) return;
    const header = ["Email", "Full name", "Username", "Company", "Kind", "Category", "Website", "Roles", "Joined"];
    const rows = filtered.map((u) => [
      u.email || "",
      u.full_name || "",
      u.username || "",
      u.company || "",
      u.profile_kind || "",
      u.category || "",
      u.website || "",
      (u.roles || []).join("|"),
      new Date(u.created_at).toISOString(),
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `resona-users-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Admin · Users</p>
          <h1 className="mt-2 font-display font-bold text-3xl lg:text-4xl text-foreground">All Users</h1>
          <p className="mt-1 text-muted-foreground">{users?.length ?? 0} registered profiles — full details and contact info.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, company…" className="pl-9 rounded-full h-10" />
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv} className="rounded-full h-10">
            <Download className="w-4 h-4 mr-1.5" /> CSV
          </Button>
        </div>
      </header>

      <Card className="rounded-2xl border-border/60 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold px-6 py-3">User</th>
                <th className="text-left font-semibold px-6 py-3">Email</th>
                <th className="text-left font-semibold px-6 py-3">Company</th>
                <th className="text-left font-semibold px-6 py-3">Kind</th>
                <th className="text-left font-semibold px-6 py-3">Roles</th>
                <th className="text-left font-semibold px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {filtered?.length === 0 && !isLoading && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No users found.</td></tr>
              )}
              {filtered?.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                          <UserCircle2 className="w-5 h-5 text-accent" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{u.full_name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground">{u.username ? `@${u.username}` : <span className="font-mono">{u.id.slice(0, 8)}…</span>}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.email ? (
                      <a href={`mailto:${u.email}`} className="inline-flex items-center gap-1.5 text-foreground hover:text-accent">
                        <Mail className="w-3.5 h-3.5" /> {u.email}
                      </a>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{u.company || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground capitalize">{u.profile_kind || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(u.roles || []).map((r) => (
                        <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className={r === "admin" ? "bg-accent text-accent-foreground" : ""}>
                          {r}
                        </Badge>
                      ))}
                      {!u.roles?.length && <span className="text-xs text-muted-foreground">none</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
