import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCreatorAnalytics() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["creator-analytics", user?.id],
    queryFn: async () => {
      const { data: podcasts } = await supabase.from("podcasts").select("id").eq("owner_id", user!.id);
      const ids = (podcasts || []).map((p) => p.id);
      if (ids.length === 0) return { totalPlays: 0, totalListened: 0, byDay: [], topEpisodes: [] };

      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data: plays } = await supabase
        .from("episode_plays")
        .select("episode_id, listened_seconds, created_at")
        .in("podcast_id", ids)
        .gte("created_at", since.toISOString());

      const totalPlays = plays?.length || 0;
      const totalListened = (plays || []).reduce((s, p) => s + (p.listened_seconds || 0), 0);

      const byDayMap = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        byDayMap.set(d.toISOString().slice(0, 10), 0);
      }
      (plays || []).forEach((p) => {
        const day = p.created_at.slice(0, 10);
        byDayMap.set(day, (byDayMap.get(day) || 0) + 1);
      });
      const byDay = Array.from(byDayMap.entries()).map(([date, plays]) => ({ date: date.slice(5), plays }));

      const epCounts = new Map<string, number>();
      (plays || []).forEach((p) => epCounts.set(p.episode_id, (epCounts.get(p.episode_id) || 0) + 1));
      const topIds = [...epCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
      let topEpisodes: { id: string; title: string; plays: number }[] = [];
      if (topIds.length) {
        const { data: eps } = await supabase.from("episodes").select("id, title").in("id", topIds);
        topEpisodes = (eps || []).map((e) => ({ id: e.id, title: e.title, plays: epCounts.get(e.id) || 0 }));
        topEpisodes.sort((a, b) => b.plays - a.plays);
      }

      return { totalPlays, totalListened, byDay, topEpisodes };
    },
    enabled: !!user,
  });
}
