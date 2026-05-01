import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic2, Loader2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Row { id: string; title: string; slug: string; owner_id: string; is_published: boolean; created_at: string; }

export default function AdminPodcasts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("podcasts").select("id,title,slug,owner_id,is_published,created_at").order("created_at", { ascending: false });
    setRows((data as Row[]) || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (r: Row) => { await supabase.from("podcasts").update({ is_published: !r.is_published }).eq("id", r.id); load(); };
  const del = async (id: string) => { if (!confirm("Delete podcast and all its episodes?")) return; await supabase.from("podcasts").delete().eq("id", id); toast.success("Deleted"); load(); };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header><h1 className="font-display font-bold text-3xl flex items-center gap-2"><Mic2 className="w-7 h-7 text-accent" /> Podcasts</h1></header>
      <Card className="p-5 rounded-2xl">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : rows.length === 0 ? <p className="text-sm text-muted-foreground">No podcasts.</p> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">/c/{r.slug} · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => toggle(r)}>
                  {r.is_published ? <><EyeOff className="w-3.5 h-3.5 mr-1" /> Hide</> : <><Eye className="w-3.5 h-3.5 mr-1" /> Show</>}
                </Button>
                <Button size="sm" variant="outline" onClick={() => del(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
