import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Download, Search, Bell } from "lucide-react";
import { useState, useMemo } from "react";

type Row = {
  id: string;
  email: string;
  created_at: string;
  podcast_id: string;
  user_id: string | null;
};

export default function Subscribers() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [podcastFilter, setPodcastFilter] = useState<string>("all");

  const { data: podcasts } = useQuery({
    queryKey: ["my-podcasts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("id, title")
        .eq("owner_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: subs, isLoading } = useQuery({
    queryKey: ["my-subscribers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcast_subscribers" as any)
        .select("id, email, created_at, podcast_id, user_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const podcastMap = useMemo(() => {
    const m: Record<string, string> = {};
    podcasts?.forEach((p) => (m[p.id] = p.title));
    return m;
  }, [podcasts]);

  const filtered = subs?.filter((s) => {
    if (podcastFilter !== "all" && s.podcast_id !== podcastFilter) return false;
    if (q && !s.email.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const exportCsv = () => {
    if (!filtered?.length) return;
    const rows = [["Email", "Podcast", "Subscribed at"], ...filtered.map((s) => [
      s.email, podcastMap[s.podcast_id] || s.podcast_id, new Date(s.created_at).toISOString(),
    ])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `subscribers-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Audience</p>
          <h1 className="mt-2 font-display font-bold text-3xl lg:text-4xl text-foreground">Subscribers</h1>
          <p className="mt-1 text-muted-foreground">{subs?.length ?? 0} listeners signed up to get notified when you publish a new episode.</p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="rounded-full"><Download className="w-4 h-4 mr-1.5" /> Export CSV</Button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email…" className="pl-9 rounded-full h-10" />
        </div>
        <select
          value={podcastFilter}
          onChange={(e) => setPodcastFilter(e.target.value)}
          className="h-10 px-4 rounded-full bg-card border border-border text-sm text-foreground"
        >
          <option value="all">All podcasts</option>
          {podcasts?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      <Card className="rounded-2xl border-border/60 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold px-6 py-3">Email</th>
                <th className="text-left font-semibold px-6 py-3">Podcast</th>
                <th className="text-left font-semibold px-6 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading && <tr><td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && !filtered?.length && (
                <tr><td colSpan={3} className="px-6 py-16 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  No subscribers yet. Share your show and add the "Get new episode alerts" button on your channel page.
                </td></tr>
              )}
              {filtered?.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 text-foreground hover:text-accent">
                      <Mail className="w-3.5 h-3.5" /> {s.email}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary">{podcastMap[s.podcast_id] || "—"}</Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
