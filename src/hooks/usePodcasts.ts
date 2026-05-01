import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Podcast = Tables<"podcasts">;

export function useMyPodcasts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-podcasts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Podcast[];
    },
    enabled: !!user,
  });
}

export function usePublicPodcasts() {
  return useQuery({
    queryKey: ["public-podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data as Podcast[];
    },
  });
}

export function usePodcastBySlug(slug?: string) {
  return useQuery({
    queryKey: ["podcast-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as Podcast | null;
    },
    enabled: !!slug,
  });
}

export function useCreatePodcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TablesInsert<"podcasts">) => {
      const { data, error } = await supabase.from("podcasts").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-podcasts"] }),
  });
}

export function useUpdatePodcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"podcasts"> }) => {
      const { data, error } = await supabase.from("podcasts").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-podcasts"] });
      qc.invalidateQueries({ queryKey: ["podcast-slug"] });
    },
  });
}

export function useDeletePodcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("podcasts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-podcasts"] }),
  });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}
