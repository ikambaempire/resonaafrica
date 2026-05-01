import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Episode = Tables<"episodes">;

export function useMyEpisodes(podcastId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-episodes", user?.id, podcastId],
    queryFn: async () => {
      let q = supabase.from("episodes").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false });
      if (podcastId) q = q.eq("podcast_id", podcastId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Episode[];
    },
    enabled: !!user,
  });
}

export function useEpisodesByPodcast(podcastId?: string) {
  return useQuery({
    queryKey: ["episodes-by-podcast", podcastId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("podcast_id", podcastId!)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as Episode[];
    },
    enabled: !!podcastId,
  });
}

export function useCreateEpisode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TablesInsert<"episodes">) => {
      const { data, error } = await supabase.from("episodes").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-episodes"] });
      qc.invalidateQueries({ queryKey: ["episodes-by-podcast"] });
    },
  });
}

export function useUpdateEpisode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"episodes"> }) => {
      const { data, error } = await supabase.from("episodes").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-episodes"] });
      qc.invalidateQueries({ queryKey: ["episodes-by-podcast"] });
    },
  });
}

export function useDeleteEpisode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("episodes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-episodes"] });
      qc.invalidateQueries({ queryKey: ["episodes-by-podcast"] });
    },
  });
}

export async function recordPlay(episodeId: string, podcastId: string, listenedSeconds = 0, userId?: string | null) {
  let anonId = localStorage.getItem("resona_anon_id");
  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem("resona_anon_id", anonId);
  }
  await supabase.from("episode_plays").insert({
    episode_id: episodeId,
    podcast_id: podcastId,
    user_id: userId ?? null,
    anon_id: anonId,
    listened_seconds: Math.max(0, Math.round(listenedSeconds)),
    source: "channel",
  });
}
