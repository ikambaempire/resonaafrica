import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Megaphone } from "lucide-react";

interface Announcement { id: string; title: string; body: string; is_active: boolean; created_at: string; }

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setItems((data as Announcement[]) || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim() || !body.trim()) { toast.error("Title and body required"); return; }
    const { error } = await supabase.from("announcements").insert({ title, body, is_active: true });
    if (error) toast.error(error.message); else { toast.success("Posted"); setTitle(""); setBody(""); load(); }
  };

  const toggle = async (a: Announcement) => {
    await supabase.from("announcements").update({ is_active: !a.is_active }).eq("id", a.id); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("announcements").delete().eq("id", id); load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="font-display font-bold text-3xl flex items-center gap-2"><Megaphone className="w-7 h-7 text-accent" /> Announcements</h1>
        <p className="text-sm text-muted-foreground mt-1">Post platform-wide messages visible to all users.</p>
      </header>
      <Card className="p-6 rounded-2xl space-y-3">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="flex justify-end"><Button onClick={create} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="w-4 h-4 mr-1" /> Post</Button></div>
      </Card>
      <Card className="p-5 rounded-2xl">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : items.length === 0 ? <p className="text-sm text-muted-foreground">No announcements yet.</p> : (
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.body}</p>
                </div>
                <Switch checked={a.is_active} onCheckedChange={() => toggle(a)} />
                <Button size="sm" variant="outline" onClick={() => del(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
