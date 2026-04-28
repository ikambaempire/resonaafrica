import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Trash2 } from "lucide-react";

const ROLES = ["admin", "editor", "viewer", "creator"] as const;
type Role = typeof ROLES[number];

export default function AdminRoles() {
  const qc = useQueryClient();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<Role>("creator");

  const { data: rows } = useQuery({
    queryKey: ["admin-all-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-min"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name");
      const m: Record<string, string> = {};
      data?.forEach((p) => { m[p.id] = p.full_name || p.id; });
      return m;
    },
  });

  const grant = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID required");
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role granted");
      setUserId("");
      qc.invalidateQueries({ queryKey: ["admin-all-roles"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role revoked");
      qc.invalidateQueries({ queryKey: ["admin-all-roles"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Admin · Roles</p>
        <h1 className="mt-2 font-display font-bold text-3xl lg:text-4xl text-foreground">Role assignments</h1>
        <p className="mt-1 text-muted-foreground">Grant or revoke admin / editor / viewer / creator privileges.</p>
      </header>

      <Card className="rounded-2xl border-border/60 bg-card p-6">
        <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" /> Grant a role
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User UUID" className="rounded-full flex-1 font-mono text-xs" />
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="rounded-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => grant.mutate()} disabled={grant.isPending} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
            {grant.isPending ? "Granting…" : "Grant"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Tip: copy a user UUID from the Users page.</p>
      </Card>

      <Card className="rounded-2xl border-border/60 bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40">
          <h2 className="font-display font-bold text-lg text-foreground">Current assignments</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-6 py-3">User</th>
              <th className="text-left font-semibold px-6 py-3">Role</th>
              <th className="text-right font-semibold px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows?.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">No assignments.</td></tr>
            )}
            {rows?.map((r) => (
              <tr key={r.id} className="hover:bg-secondary/30">
                <td className="px-6 py-3">
                  <p className="font-semibold text-foreground">{profiles?.[r.user_id] || "—"}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{r.user_id}</p>
                </td>
                <td className="px-6 py-3">
                  <Badge className={r.role === "admin" ? "bg-accent text-accent-foreground" : ""} variant={r.role === "admin" ? "default" : "secondary"}>
                    {r.role}
                  </Badge>
                </td>
                <td className="px-6 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => revoke.mutate(r.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
