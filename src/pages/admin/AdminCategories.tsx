import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCategories, useUpsertCategory, useDeleteCategory, Category } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FolderTree, Upload, Loader2 } from "lucide-react";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useCategories();
  const upsert = useUpsertCategory();
  const del = useDeleteCategory();
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [uploading, setUploading] = useState(false);

  const open = (c?: Category) => setEditing(c ? { ...c } : { slug: "", name: "", emoji: "", thumbnail_url: "", blurb: "", sort_order: (categories.at(-1)?.sort_order ?? 100) + 10 });
  const close = () => setEditing(null);

  const onUploadThumb = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `categories/${editing.slug || slugify(editing.name || "cat")}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("podcast-covers").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("podcast-covers").getPublicUrl(path);
      setEditing((prev) => prev ? { ...prev, thumbnail_url: data.publicUrl } : prev);
      toast.success("Thumbnail uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setUploading(false); }
  };

  const save = async () => {
    if (!editing) return;
    const slug = (editing.slug || slugify(editing.name || "")).toLowerCase();
    if (!editing.name || !slug) { toast.error("Name and slug are required"); return; }
    try {
      await upsert.mutateAsync({ ...editing, slug, name: editing.name! });
      toast.success(editing.id ? "Category updated" : "Category created");
      close();
    } catch (e) { toast.error((e as Error).message); }
  };

  const remove = async (c: Category) => {
    if (!confirm(`Delete category "${c.name}"? Existing podcasts keep their category slug but will no longer match a known category.`)) return;
    try { await del.mutateAsync(c.id); toast.success("Deleted"); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Admin</p>
          <h1 className="mt-2 font-display font-bold text-3xl lg:text-4xl flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-accent" /> Categories
          </h1>
          <p className="mt-1 text-muted-foreground">Manage the categories shown across Discover and the upload form.</p>
        </div>
        <Button onClick={() => open()} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-1" /> New category
        </Button>
      </header>

      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Card key={c.id} className="rounded-2xl overflow-hidden border-border/60">
              <div className="aspect-[4/3] bg-secondary/40 overflow-hidden">
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">{c.emoji ?? "🎙️"}</div>
                )}
              </div>
              <div className="p-4">
                <p className="font-display font-bold text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.blurb || c.slug}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => open(c)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(c)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-muted-foreground">
                  Name
                  <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} />
                </label>
                <label className="text-xs text-muted-foreground">
                  Slug
                  <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
                </label>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3">
                <label className="text-xs text-muted-foreground">
                  Emoji
                  <Input value={editing.emoji ?? ""} maxLength={4} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} />
                </label>
                <label className="text-xs text-muted-foreground">
                  Sort order
                  <Input type="number" value={editing.sort_order ?? 100} onChange={(e) => setEditing({ ...editing, sort_order: +e.target.value })} />
                </label>
              </div>
              <label className="text-xs text-muted-foreground block">
                Short description
                <Textarea rows={2} value={editing.blurb ?? ""} onChange={(e) => setEditing({ ...editing, blurb: e.target.value })} />
              </label>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Thumbnail</label>
                {editing.thumbnail_url && <img src={editing.thumbnail_url} alt="" className="w-full aspect-[4/3] object-cover rounded-lg mb-2" />}
                <Input value={editing.thumbnail_url ?? ""} placeholder="https://..." onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} />
                <div className="mt-2">
                  <label className="inline-flex items-center gap-2 text-xs cursor-pointer text-accent hover:underline">
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? "Uploading…" : "Upload an image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadThumb(f); }} />
                  </label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {upsert.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
