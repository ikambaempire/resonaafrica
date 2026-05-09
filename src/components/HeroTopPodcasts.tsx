import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Play, TrendingUp, Headphones } from "lucide-react";

type Row = {
  podcast_id: string;
  plays: number;
  podcast: { id: string; slug: string; title: string; cover_url: string | null; category: string | null } | null;
};

const palette = [
  "from-[#1aa6e0] to-[#1577b8]",
  "from-[#ff7a3a] to-[#e64f1e]",
  "from-[#e63946] to-[#a51d2d]",
  "from-[#ffb929] to-[#d99410]",
  "from-[#2dd4bf] to-[#0f766e]",
  "from-[#a855f7] to-[#7e22ce]",
  "from-[#ef4444] to-[#991b1b]",
  "from-[#0ea5e9] to-[#075985]",
  "from-[#f59e0b] to-[#92400e]",
  "from-[#10b981] to-[#065f46]",
];

function formatPlays(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

export function HeroTopPodcasts() {
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["hero-top-podcasts"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.rpc("get_top_podcasts", { _limit: 10 });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        podcast_id: r.podcast_id,
        plays: Number(r.plays) || 0,
        podcast: {
          id: r.podcast_id,
          slug: r.slug,
          title: r.title,
          cover_url: r.cover_url,
          category: r.category,
        },
      }));
    },
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  // Realtime: refresh on new plays (works for signed-in users with read access; anon falls back to polling above)
  useEffect(() => {
    const ch = supabase
      .channel("hero-top-plays")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "episode_plays" }, () => {
        qc.invalidateQueries({ queryKey: ["hero-top-podcasts"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return (
    <div className="relative">
      {/* Soft glow */}
      <div className="absolute -inset-6 bg-accent/20 blur-3xl rounded-[2.5rem] -z-10" aria-hidden />

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 lg:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-bold">Live</p>
              <h3 className="font-display font-bold text-foreground text-lg leading-tight">Top 10 Most Viewed</h3>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/60">Updated in real time</span>
        </div>

        <div className="space-y-2.5 max-h-[460px] overflow-hidden">
          <AnimatePresence initial={false}>
            {data.length === 0 && (
              <div className="py-12 text-center text-sm text-foreground/60">
                <Headphones className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Views will appear here as listeners tune in.
              </div>
            )}
            {data.map((row, i) => {
              const p = row.podcast!;
              const grad = palette[i % palette.length];
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, delay: i * 0.03 }}
                >
                  <Link
                    to={`/c/${p.slug}`}
                    className={`group relative flex items-center gap-3 rounded-2xl bg-gradient-to-r ${grad} p-2 pr-4 hover:scale-[1.015] transition-transform shadow-lg`}
                  >
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-[11px] font-display font-bold text-white border border-white/20">
                      {i + 1}
                    </span>
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 ring-2 ring-white/30 ml-5">
                      {p.cover_url ? (
                        <img src={p.cover_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-black/30 flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-white/70" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-white text-sm leading-tight truncate">{p.title}</p>
                      <p className="text-[11px] text-white/80 truncate">{p.category || "Podcast"}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/95 shrink-0">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="font-display font-bold text-sm tabular-nums">{formatPlays(row.plays)}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-[11px] text-foreground/60">Auto-ranked by total plays</p>
          <Link to="/discover" className="text-[11px] font-semibold text-accent hover:underline">Browse all →</Link>
        </div>
      </div>
    </div>
  );
}
