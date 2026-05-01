import { useState } from "react";
import { useMyEpisodes } from "@/hooks/useEpisodes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2 } from "lucide-react";

interface Clip { title: string; hook: string; suggested_duration_seconds: number; }

export default function AIClips() {
  const { data: episodes = [] } = useMyEpisodes();
  const [selected, setSelected] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const ep = episodes.find((e) => e.id === selected);

  const generate = async () => {
    if (!selected) { toast.error("Choose an episode"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-clips", { body: { episodeId: selected } });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      toast.success("AI clips generated");
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoading(false); }
  };

  const clips: Clip[] = Array.isArray(ep?.ai_clips) ? (ep!.ai_clips as unknown as Clip[]) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="font-display font-bold text-3xl lg:text-4xl flex items-center gap-3"><Sparkles className="w-8 h-8 text-accent" /> AI Clips</h1>
        <p className="mt-1 text-muted-foreground">Generate transcript outlines and short-clip ideas with one click.</p>
      </header>

      <Card className="p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Pick an episode" /></SelectTrigger>
            <SelectContent>
              {episodes.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={generate} disabled={!selected || loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Wand2 className="w-4 h-4 mr-1" />} Generate
          </Button>
        </div>
        {episodes.length === 0 && <p className="text-sm text-muted-foreground">Create an episode first in Content.</p>}
      </Card>

      {ep?.transcript && (
        <Card className="p-6 rounded-2xl">
          <h2 className="font-display font-bold text-xl mb-3">Transcript outline</h2>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">{ep.transcript}</pre>
        </Card>
      )}

      {clips.length > 0 && (
        <Card className="p-6 rounded-2xl">
          <h2 className="font-display font-bold text-xl mb-4">Suggested clips</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {clips.map((c, i) => (
              <div key={i} className="rounded-xl bg-secondary/40 p-4 space-y-2">
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c.hook}</p>
                <p className="text-xs text-accent">~{c.suggested_duration_seconds}s</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
