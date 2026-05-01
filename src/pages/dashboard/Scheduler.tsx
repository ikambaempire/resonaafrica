import { useMyEpisodes, useUpdateEpisode } from "@/hooks/useEpisodes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Scheduler() {
  const { data: episodes = [], isLoading } = useMyEpisodes();
  const update = useUpdateEpisode();
  const [editing, setEditing] = useState<Record<string, string>>({});

  const scheduled = episodes.filter((e) => e.status === "scheduled").sort((a, b) => (a.scheduled_at || "").localeCompare(b.scheduled_at || ""));
  const drafts = episodes.filter((e) => e.status === "draft");

  const schedule = async (id: string) => {
    const dt = editing[id];
    if (!dt) { toast.error("Pick a date/time first"); return; }
    await update.mutateAsync({ id, updates: { status: "scheduled", scheduled_at: new Date(dt).toISOString() } });
    toast.success("Scheduled");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="font-display font-bold text-3xl lg:text-4xl">Scheduler</h1>
        <p className="mt-1 text-muted-foreground">Plan publish dates. Episodes auto-publish when their scheduled time arrives.</p>
      </header>

      {isLoading && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}

      <Card className="p-6 rounded-2xl">
        <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-accent" /> Upcoming</h2>
        {scheduled.length === 0 ? <p className="text-sm text-muted-foreground">Nothing scheduled.</p> : (
          <div className="space-y-2">
            {scheduled.map((ep) => (
              <div key={ep.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                <div className="flex-1">
                  <p className="font-semibold">{ep.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(ep.scheduled_at!).toLocaleString()}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => update.mutate({ id: ep.id, updates: { status: "draft", scheduled_at: null } }, { onSuccess: () => toast.success("Moved to draft") })}>Cancel</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 rounded-2xl">
        <h2 className="font-display font-bold text-xl mb-4">Drafts ready to schedule</h2>
        {drafts.length === 0 ? <p className="text-sm text-muted-foreground">No drafts.</p> : (
          <div className="space-y-2">
            {drafts.map((ep) => (
              <div key={ep.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-secondary/40">
                <p className="flex-1 font-medium">{ep.title}</p>
                <Input type="datetime-local" value={editing[ep.id] || ""} onChange={(e) => setEditing((s) => ({ ...s, [ep.id]: e.target.value }))} className="sm:w-56" />
                <Button size="sm" onClick={() => schedule(ep.id)} className="bg-accent text-accent-foreground hover:bg-accent/90">Schedule</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
