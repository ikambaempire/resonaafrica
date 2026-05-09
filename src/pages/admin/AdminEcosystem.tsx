import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff, Mic2 } from "lucide-react";

type Entry = {
  id: string;
  name: string;
  category: string;
  city: string | null;
  country: string | null;
  description: string | null;
  website: string | null;
  contact_email: string | null;
  logo_url: string | null;
  cover_url: string | null;
  tags: string[] | null;
  sort_order: number;
  is_hidden: boolean;
};

const empty = {
  name: "",
  category: "Recording Studios",
  city: "",
  country: "",
  description: "",
  website: "",
  contact_email: "",
  logo_url: "",
  cover_url: "",
  tags: "",
  sort_order: 100,
};

export default function AdminEcosystem() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);

  const { data: rows = [] } = useQuery({
    queryKey: ["admin-ecosystem"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ecosystem_entries")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Entry[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!form.name || !form.category) throw new Error("Name and category are required");
      const payload = {
        name: form.name,
        category: form.category,
        city: form.city || null,
        country: form.country || null,
        description: form.description || null,
        website: form.website || null,
        contact_email: form.contact_email || null,
        logo_url: form.logo_url || null,
        cover_url: form.cover_url || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        sort_order: Number(form.sort_order) || 100,
      };
      const { error } = await supabase.from("ecosystem_entries").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entry added");
      setForm(empty);
      qc.invalidateQueries({ queryKey: ["admin-ecosystem"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleHidden = useMutation({
    mutationFn: async (e: Entry) => {
      const { error } = await supabase.from("ecosystem_entries").update({ is_hidden: !e.is_hidden }).eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-ecosystem"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ecosystem_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entry removed");
      qc.invalidateQueries({ queryKey: ["admin-ecosystem"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Admin · Ecosystem</p>
        <h1 className="mt-2 font-display font-bold text-3xl lg:text-4xl text-foreground">Ecosystem directory</h1>
        <p className="mt-1 text-muted-foreground">Add, hide or remove studios and partners shown on the public Ecosystem page.</p>
      </header>

      <Card className="rounded-2xl border-border/60 bg-card p-6">
        <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-accent" /> Add new entry
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Category * (e.g. Recording Studios)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <Input placeholder="Website URL" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input placeholder="Contact email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          <Input placeholder="Logo URL" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
          <Input placeholder="Cover image URL" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} />
          <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="md:col-span-2" />
          <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2" rows={3} />
          <Input type="number" placeholder="Sort order (100 default)" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => create.mutate()} disabled={create.isPending} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
            {create.isPending ? "Adding…" : "Add entry"}
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl border-border/60 bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-foreground">All entries</h2>
          <span className="text-xs text-muted-foreground">{rows.length} total</span>
        </div>
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-muted-foreground">No entries yet.</p>
        ) : (
          <ul className="divide-y divide-border/40">
            {rows.map((e) => (
              <li key={e.id} className="px-6 py-4 flex items-center gap-4">
                {e.logo_url ? (
                  <img src={e.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Mic2 className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{e.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {e.category} {e.city && `· ${e.city}`} {e.country && `· ${e.country}`}
                  </p>
                </div>
                {e.is_hidden && <Badge variant="secondary">Hidden</Badge>}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">Visible</span>
                  <Switch checked={!e.is_hidden} onCheckedChange={() => toggleHidden.mutate(e)} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => toggleHidden.mutate(e)} className="text-muted-foreground">
                  {e.is_hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove.mutate(e.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
