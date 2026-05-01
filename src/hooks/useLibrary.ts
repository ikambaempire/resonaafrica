import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id, episode_id, created_at, episodes(*, podcasts(title, slug, cover_url))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useWatchLater() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["watch-later", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("watch_later")
        .select("id, episode_id, created_at, episodes(*, podcasts(title, slug, cover_url))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useToggleBookmark() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (episodeId: string) => {
      const { data: existing } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user!.id)
        .eq("episode_id", episodeId)
        .maybeSingle();
      if (existing) {
        await supabase.from("bookmarks").delete().eq("id", existing.id);
        return false;
      }
      await supabase.from("bookmarks").insert({ user_id: user!.id, episode_id: episodeId });
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

export function useToggleWatchLater() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (episodeId: string) => {
      const { data: existing } = await supabase
        .from("watch_later")
        .select("id")
        .eq("user_id", user!.id)
        .eq("episode_id", episodeId)
        .maybeSingle();
      if (existing) {
        await supabase.from("watch_later").delete().eq("id", existing.id);
        return false;
      }
      await supabase.from("watch_later").insert({ user_id: user!.id, episode_id: episodeId });
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watch-later"] }),
  });
}
