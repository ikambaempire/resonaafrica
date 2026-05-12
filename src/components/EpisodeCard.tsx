import { Link } from "react-router-dom";
import { Play, Mic2 } from "lucide-react";

function fmtDuration(s: number | null) {
  if (!s || s < 1) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function fmtAge(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (d < 1) return "today";
  if (d < 2) return "yesterday";
  if (d < 7) return `${Math.floor(d)} days ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export function EpisodeCard({
  ep,
  podcastTitle,
  podcastSlug,
  cover,
  plays,
}: {
  ep: { id: string; title: string; description: string | null; cover_url: string | null; duration_seconds: number | null; published_at: string | null; created_at: string };
  podcastTitle?: string;
  podcastSlug?: string;
  cover?: string | null;
  plays?: number;
}) {
  const dur = fmtDuration(ep.duration_seconds);
  const thumb = ep.cover_url || cover;
  return (
    <div className="group">
      <Link to={`/watch/${ep.id}`} className="block">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary border border-border/40">
          {thumb ? (
            <img src={thumb} alt={ep.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center gradient-gold">
              <Mic2 className="w-10 h-10 text-primary" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center shadow-2xl">
              <Play className="w-6 h-6 text-primary fill-primary" />
            </div>
          </div>
          {dur && (
            <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-background/90 text-foreground px-1.5 py-0.5 rounded">{dur}</span>
          )}
        </div>
      </Link>
      <div className="mt-3">
        <Link to={`/watch/${ep.id}`}>
          <p className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">{ep.title}</p>
        </Link>
        {podcastTitle && (
          <Link to={podcastSlug ? `/c/${podcastSlug}` : "#"} className="block text-xs text-muted-foreground mt-1 hover:text-foreground">{podcastTitle}</Link>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">
          {plays != null && <>{plays.toLocaleString()} plays · </>}{fmtAge(ep.published_at || ep.created_at)}
        </p>
      </div>
    </div>
  );
}
