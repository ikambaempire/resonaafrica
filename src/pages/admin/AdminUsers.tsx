import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Search, UserCircle2 } from "lucide-react";

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, company, avatar_url, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["admin-users-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      const map: Record<string, string[]> = {};
      data?.forEach((r) => { (map[r.user_id] ||= []).push(r.role); });
      return map;
    },
  });

  const filtered = users?.filter((u) =>
    !q || (u.full_name || "").toLowerCase().includes(q.toLowerCase()) || (u.company || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Admin · Users</p>
          <h1 className="mt-2 font-display font-bold text-3xl lg:text-4xl text-foreground">All Users</h1>
          <p className="mt-1 text-muted-foreground">{users?.length ?? 0} registered profiles on the platform.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users…" className="pl-9 rounded-full h-10" />
        </div>
      </header>

      <Card className="rounded-2xl border-border/60 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold px-6 py-3">User</th>
                <th className="text-left font-semibold px-6 py-3">Company</th>
                <th className="text-left font-semibold px-6 py-3">Roles</th>
                <th className="text-left font-semibold px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {filtered?.length === 0 && !isLoading && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No users found.</td></tr>
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
                        <p className="text-xs text-muted-foreground font-mono">{u.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{u.company || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(roles?.[u.id] || []).map((r) => (
                        <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className={r === "admin" ? "bg-accent text-accent-foreground" : ""}>
                          {r}
                        </Badge>
                      ))}
                      {!roles?.[u.id]?.length && <span className="text-xs text-muted-foreground">none</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
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
