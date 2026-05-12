import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { AudioPlayer } from "@/components/AudioPlayer";
import { EpisodeCard } from "@/components/EpisodeCard";
import { SubscribeByEmailButton } from "@/components/SubscribeByEmailButton";
import { TipDialog } from "@/components/TipDialog";
import { PremiumSubscribeButton } from "@/components/PremiumSubscribeButton";
import { Loader2, Mic2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type Ep = {
  id: string; title: string; description: string | null; cover_url: string | null;
  duration_seconds: number | null; published_at: string | null; created_at: string;
  hosting: string; media_url: string | null; embed_provider: string | null; embed_url: string | null; youtube_video_id: string | null;
  podcast_id: string;
  podcasts: { id: string; title: string; slug: string; cover_url: string | null; description: string | null; category: string | null } | null;
};

export default function Watch() {
  const { episodeId } = useParams();
  const [ep, setEp] = useState<Ep | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!episodeId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("episodes")
        .select("*, podcasts(id,title,slug,cover_url,description,category)")
        .eq("id", episodeId)
        .maybeSingle();
      if (data) {
        setEp(data as any);
        // record play
        await supabase.from("episode_plays").insert({
          podcast_id: (data as any).podcast_id,
          episode_id: (data as any).id,
          source: "watch_page",
        } as any);

        const { data: rel } = await supabase
          .from("episodes").select("*")
          .eq("podcast_id", (data as any).podcast_id)
          .eq("status", "published")
          .neq("id", (data as any).id)
          .order("published_at", { ascending: false }).limit(8);
        setRelated(rel ?? []);

        const { data: trend } = await supabase
          .from("episodes")
          .select("id,title,description,cover_url,duration_seconds,published_at,created_at,podcast_id,podcasts(title,slug,cover_url)")
          .eq("status", "published").eq("is_premium", false)
          .neq("podcast_id", (data as any).podcast_id)
          .order("published_at", { ascending: false }).limit(8);
        setTrending(trend ?? []);
      }
      setLoading(false);
    })();
  }, [episodeId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (!ep) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Episode not found.</div>;

  const pod = ep.podcasts;
  const isYouTube = ep.embed_provider === "youtube" || !!ep.youtube_video_id;
  const ytId = ep.youtube_video_id || (ep.embed_url?.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
          {/* Player + meta */}
          <div>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black">
              {isYouTube && ytId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={ep.title}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : ep.media_url ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-6">
                  <div className="w-full max-w-2xl">
                    <AudioPlayer src={ep.media_url} title={ep.title} poster={ep.cover_url ?? pod?.cover_url ?? undefined} />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No media available.</div>
              )}
            </div>

            <h1 className="mt-5 font-display font-bold text-2xl lg:text-3xl">{ep.title}</h1>

            {pod && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link to={`/c/${pod.slug}`} className="flex items-center gap-3 group">
                  {pod.cover_url ? (
                    <img src={pod.cover_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : <div className="w-11 h-11 rounded-full gradient-gold flex items-center justify-center"><Mic2 className="w-5 h-5 text-primary" /></div>}
                  <div>
                    <p className="font-semibold group-hover:text-accent transition-colors">{pod.title}</p>
                    <p className="text-xs text-muted-foreground">{pod.category}</p>
                  </div>
                </Link>
                <div className="flex flex-wrap gap-2 ml-auto">
                  <SubscribeByEmailButton podcastId={pod.id} podcastTitle={pod.title} />
                  <TipDialog podcastId={pod.id} episodeId={ep.id} creatorName={pod.title} />
                  <PremiumSubscribeButton podcastId={pod.id} />
                </div>
              </div>
            )}

            {ep.description && (
              <Card className="mt-6 p-5 rounded-2xl border-border/60">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">About this episode</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{ep.description}</p>
              </Card>
            )}
          </div>

          {/* Up next */}
          <aside className="space-y-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">Up next</h2>
            {related.map((r) => (
              <Link key={r.id} to={`/watch/${r.id}`} className="flex gap-3 group">
                <div className="w-40 aspect-video shrink-0 rounded-lg overflow-hidden bg-secondary">
                  {(r.cover_url || pod?.cover_url) ? <img src={r.cover_url || pod?.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-gold" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{pod?.title}</p>
                </div>
              </Link>
            ))}
            {trending.length > 0 && (
              <>
                <h2 className="font-display font-bold text-lg pt-4 mt-4 border-t border-border/40">Trending across Resona</h2>
                {trending.slice(0, 5).map((t) => (
                  <Link key={t.id} to={`/watch/${t.id}`} className="flex gap-3 group">
                    <div className="w-40 aspect-video shrink-0 rounded-lg overflow-hidden bg-secondary">
                      {(t.cover_url || t.podcasts?.cover_url) ? <img src={t.cover_url || t.podcasts?.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-gold" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.podcasts?.title}</p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
