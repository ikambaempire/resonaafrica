import { useParams, Link } from "react-router-dom";
import { usePodcastBySlug } from "@/hooks/usePodcasts";
import { useEpisodesByPodcast } from "@/hooks/useEpisodes";
import { recordPlay } from "@/hooks/useEpisodes";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleBookmark, useToggleWatchLater } from "@/hooks/useLibrary";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/AudioPlayer";
import { VideoPlayer, EmbedPlayer } from "@/components/MediaPlayers";
import { ChannelStats } from "@/components/ChannelStats";
import { PublisherCard } from "@/components/PublisherCard";
import { TipDialog } from "@/components/TipDialog";
import { PremiumSubscribeButton } from "@/components/PremiumSubscribeButton";
import { Mic2, Loader2, Bookmark, Clock, Heart, BadgeCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ChannelPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: podcast, isLoading } = usePodcastBySlug(slug);
  const { data: episodes = [] } = useEpisodesByPodcast(podcast?.id);
  const [activeId, setActiveId] = useState<string | undefined>();
  const toggleBm = useToggleBookmark();
  const toggleWl = useToggleWatchLater();
  const active = episodes.find((e) => e.id === activeId) || episodes[0];

  // For embed episodes (YouTube, Spotify, etc.) we can't hook into the iframe's play events,
  // so record a single view when an embed episode becomes active.
  const recordedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!active) return;
    if (active.hosting !== "embed" || !active.embed_url) return;
    if (recordedRef.current.has(active.id)) return;
    recordedRef.current.add(active.id);
    recordPlay(active.id, active.podcast_id, 0, user?.id);
  }, [active?.id, user?.id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!podcast) return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Channel not found.</p></div>
      <Footer />
    </div>
  );

  const onPlay = () => active && recordPlay(active.id, active.podcast_id, 0, user?.id);
  const onProgress = (s: number) => active && recordPlay(active.id, active.podcast_id, s, user?.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1">
        <section className="gradient-hero py-12 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
            {podcast.cover_url ? (
              <img src={podcast.cover_url} alt={podcast.title} className="w-40 h-40 md:w-56 md:h-56 rounded-2xl object-cover shadow-soft" />
            ) : (
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl gradient-gold flex items-center justify-center shadow-gold"><Mic2 className="w-16 h-16 text-primary" /></div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                Podcast {podcast.category && <span>· {podcast.category}</span>}
                <BadgeCheck className="w-4 h-4" />
              </div>
              <h1 className="font-display font-bold text-4xl lg:text-5xl text-foreground mt-2">{podcast.title}</h1>
              <p className="mt-3 text-muted-foreground max-w-2xl">{podcast.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <TipDialog podcastId={podcast.id} episodeId={active?.id} creatorName={podcast.title} />
                <PremiumSubscribeButton podcastId={podcast.id} />
              </div>
            </div>
          </div>
        </section>

        {active && (
          <section className="px-6 lg:px-8 -mt-6 max-w-6xl mx-auto space-y-4">
            <PublisherCard ownerId={podcast.owner_id} />
            {active.hosting === "embed" && active.embed_url ? (
              <EmbedPlayer provider={active.embed_provider} url={active.embed_url} title={active.title} />
            ) : active.media_url && active.media_kind === "video" ? (
              <VideoPlayer src={active.media_url} title={active.title} poster={active.cover_url || podcast.cover_url || undefined} onProgress={onProgress} onPlay={onPlay} />
            ) : active.media_url ? (
              <AudioPlayer src={active.media_url} title={active.title} poster={active.cover_url || podcast.cover_url || undefined} onProgress={onProgress} onPlay={onPlay} />
            ) : (
              <Card className="p-8 text-center text-muted-foreground rounded-2xl">No media for this episode.</Card>
            )}
          </section>
        )}

        <ChannelStats podcastId={podcast.id} episodeCount={episodes.length} />

        <section className="px-6 lg:px-8 py-10 max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-2xl mb-4">Episodes</h2>
          {episodes.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground rounded-2xl">No published episodes yet.</Card>
          ) : (
            <div className="space-y-2">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => { setActiveId(ep.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`w-full text-left flex items-center gap-4 p-4 rounded-xl transition-colors ${active?.id === ep.id ? "bg-accent/10 border border-accent/40" : "bg-card hover:bg-secondary/40 border border-border"}`}
                >
                  <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center shrink-0"><Mic2 className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{ep.title}</p>
                      {ep.is_premium && <Badge className="bg-accent/20 text-accent border-accent/30">Premium</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{ep.description}</p>
                  </div>
                  {user && (
                    <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => toggleBm.mutate(ep.id, { onSuccess: (added) => toast.success(added ? "Bookmarked" : "Removed") })}><Bookmark className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleWl.mutate(ep.id, { onSuccess: (added) => toast.success(added ? "Saved for later" : "Removed") })}><Clock className="w-4 h-4" /></Button>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
