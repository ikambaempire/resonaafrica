import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { useMyStudios, useUpsertStudio, useDeleteStudio, type Studio } from "@/hooks/useStudios";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { slugify } from "@/hooks/usePodcasts";

export default function StudioOverview() {
  const { data: studios = [] } = useMyStudios();
  const totalPublished = studios.filter((s) => s.is_published).length;
  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-3xl">Welcome back</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Studios" value={studios.length} />
        <Stat label="Published" value={totalPublished} />
        <Stat label="Drafts" value={studios.length - totalPublished} />
      </div>
      <Card className="p-6 rounded-2xl">
        <p className="font-semibold mb-2">Get bookings rolling</p>
        <p className="text-sm text-muted-foreground">Add a studio, publish it, and accept paid bookings — Resona handles the payment and you keep 80%.</p>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5 rounded-2xl">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display font-bold text-3xl mt-1">{value}</p>
    </Card>
  );
}

export function MyStudiosPage() {
  const { user } = useAuth();
  const { data: studios = [], isLoading } = useMyStudios();
  const upsert = useUpsertStudio();
  const del = useDeleteStudio();
  const [editing, setEditing] = useState<Studio | null>(null);
  const [open, setOpen] = useState(false);

  const newStudio = (): Partial<Studio> => ({
    name: "", slug: "", city: "", country: "", description: "", hourly_rate_cents: 5000,
    currency: "usd", photos: [], amenities: [], capacity: 4, is_published: false,
  });

  const startNew = () => { setEditing(newStudio() as any); setOpen(true); };
  const startEdit = (s: Studio) => { setEditing(s); setOpen(true); };

  const save = async () => {
    if (!editing || !user) return;
    if (!editing.name) { toast.error("Name required"); return; }
    const slug = editing.slug || slugify(editing.name) + "-" + Math.random().toString(36).slice(2, 6);
    try {
      await upsert.mutateAsync({ ...editing, slug, owner_id: user.id, name: editing.name } as any);
      toast.success("Saved");
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-3xl">My studios</h1>
        <Button onClick={startNew} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="w-4 h-4 mr-1" /> Add studio</Button>
      </div>

      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : studios.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed">
          <Building2 className="w-10 h-10 text-accent mx-auto mb-2" />
          <p className="font-semibold">Add your first studio to start accepting bookings.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {studios.map((s) => (
            <Card key={s.id} className="p-5 rounded-2xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display font-bold text-lg">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{[s.city, s.country].filter(Boolean).join(", ")}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.is_published ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"}`}>{s.is_published ? "LIVE" : "DRAFT"}</span>
              </div>
              <p className="text-sm mt-3"><span className="text-accent font-semibold">${(s.hourly_rate_cents / 100).toFixed(2)}</span><span className="text-muted-foreground"> / hr</span></p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(s)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => del.mutate(s.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit studio" : "New studio"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value } as any)} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>City</Label><Input value={editing.city || ""} onChange={(e) => setEditing({ ...editing, city: e.target.value } as any)} /></div>
                <div><Label>Country</Label><Input value={editing.country || ""} onChange={(e) => setEditing({ ...editing, country: e.target.value } as any)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Hourly rate (USD)</Label><Input type="number" value={(editing.hourly_rate_cents || 0) / 100} onChange={(e) => setEditing({ ...editing, hourly_rate_cents: Math.round(parseFloat(e.target.value || "0") * 100) } as any)} /></div>
                <div><Label>Capacity</Label><Input type="number" value={editing.capacity || 1} onChange={(e) => setEditing({ ...editing, capacity: parseInt(e.target.value || "1", 10) } as any)} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value } as any)} rows={4} /></div>
              <div><Label>Cover image URL</Label><Input value={editing.cover_url || ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value } as any)} /></div>
              <div><Label>Amenities (comma separated)</Label><Input value={(editing.amenities || []).join(", ")} onChange={(e) => setEditing({ ...editing, amenities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } as any)} /></div>
              <div><Label>Photo URLs (comma separated)</Label><Input value={(editing.photos || []).join(", ")} onChange={(e) => setEditing({ ...editing, photos: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } as any)} /></div>
              <div className="flex items-center justify-between pt-2">
                <Label>Published</Label>
                <Switch checked={!!editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v } as any)} />
              </div>
              <Button onClick={save} disabled={upsert.isPending} className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                {upsert.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StudioBookingsPage() {
  const { data: bookings = [], isLoading } = useOwnerBookings();
  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-3xl">Bookings</h1>
      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : bookings.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed text-muted-foreground">No bookings yet.</Card>
      ) : (
        <Card className="rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr><th className="text-left p-3">Studio</th><th className="text-left p-3">When</th><th className="text-left p-3">Booker</th><th className="text-right p-3">Total</th><th className="text-left p-3">Status</th></tr>
            </thead>
            <tbody>
              {bookings.map((b: any) => (
                <tr key={b.id} className="border-t border-border/40">
                  <td className="p-3">{b.studios?.name || "—"}</td>
                  <td className="p-3">{new Date(b.start_at).toLocaleString()}<br /><span className="text-xs text-muted-foreground">{b.hours}h</span></td>
                  <td className="p-3">{b.booker_name}<br /><span className="text-xs text-muted-foreground">{b.booker_email}</span></td>
                  <td className="p-3 text-right">${(b.total_cents / 100).toFixed(2)}</td>
                  <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

import { useOwnerBookings } from "@/hooks/useStudios";

export function StudioEarningsPage() {
  const { data: bookings = [] } = useOwnerBookings();
  const confirmed = bookings.filter((b: any) => b.status === "confirmed");
  const gross = confirmed.reduce((s: number, b: any) => s + (b.total_cents || 0), 0);
  const fees = confirmed.reduce((s: number, b: any) => s + (b.platform_fee_cents || 0), 0);
  const net = gross - fees;
  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-3xl">Earnings</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Gross bookings" value={gross / 100} />
        <Stat label="Platform fees (20%)" value={fees / 100} />
        <Stat label="Net (you keep)" value={net / 100} />
      </div>
      <p className="text-xs text-muted-foreground">Payouts run weekly via Paddle.</p>
    </div>
  );
}

export function StudioSettingsPage() {
  return <div className="space-y-6"><h1 className="font-display font-bold text-3xl">Settings</h1><Card className="p-6 rounded-2xl text-muted-foreground">Account settings coming soon.</Card></div>;
}
