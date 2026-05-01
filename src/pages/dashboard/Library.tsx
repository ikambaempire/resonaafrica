import { useBookmarks, useToggleBookmark, useToggleWatchLater, useWatchLater } from "@/hooks/useLibrary";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Clock, Mic2, Play, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface Row {
  id: string;
  episode_id: string;
  episodes: {
    id: string;
    title: string;
    cover_url: string | null;
    podcasts: { title: string; slug: string; cover_url: string | null } | null;
  } | null;
}

function ItemList({ rows, onRemove, emptyText }: { rows: Row[]; onRemove: (episodeId: string) => void; emptyText: string }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground py-8 text-center">{emptyText}</p>;
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const ep = r.episodes;
        const cover = ep?.cover_url || ep?.podcasts?.cover_url;
        return (
          <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
            {cover ? <img src={cover} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center"><Mic2 className="w-5 h-5 text-primary" /></div>}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{ep?.title || "Episode"}</p>
              <p className="text-xs text-muted-foreground truncate">{ep?.podcasts?.title}</p>
            </div>
            {ep?.podcasts?.slug && <Button asChild size="sm" variant="outline"><Link to={`/c/${ep.podcasts.slug}`}><Play className="w-3.5 h-3.5 mr-1" /> Open</Link></Button>}
            <Button size="sm" variant="outline" onClick={() => onRemove(r.episode_id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        );
      })}
    </div>
  );
}

export default function Bookmarks() {
  const { data, isLoading } = useBookmarks();
  const toggle = useToggleBookmark();
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header><h1 className="font-display font-bold text-3xl lg:text-4xl flex items-center gap-2"><Bookmark className="w-7 h-7 text-accent" /> Bookmarks</h1></header>
      <Card className="p-5 rounded-2xl">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ItemList rows={(data as unknown as Row[]) || []} onRemove={(id) => toggle.mutate(id)} emptyText="No bookmarks yet." />}
      </Card>
    </div>
  );
}

export function WatchLaterPage() {
  const { data, isLoading } = useWatchLater();
  const toggle = useToggleWatchLater();
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header><h1 className="font-display font-bold text-3xl lg:text-4xl flex items-center gap-2"><Clock className="w-7 h-7 text-accent" /> Watch later</h1></header>
      <Card className="p-5 rounded-2xl">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ItemList rows={(data as unknown as Row[]) || []} onRemove={(id) => toggle.mutate(id)} emptyText="Nothing saved for later." />}
      </Card>
    </div>
  );
}
