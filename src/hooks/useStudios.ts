import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Studio = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  city: string | null;
  country: string | null;
  description: string | null;
  hourly_rate_cents: number;
  currency: string;
  photos: string[];
  amenities: string[];
  capacity: number;
  cover_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_published: boolean;
  created_at: string;
};

export function usePublicStudios() {
  return useQuery({
    queryKey: ["public-studios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studios" as any)
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Studio[];
    },
  });
}

export function useStudioBySlug(slug?: string) {
  return useQuery({
    queryKey: ["studio-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studios" as any)
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Studio | null;
    },
    enabled: !!slug,
  });
}

export function useMyStudios() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-studios", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studios" as any)
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Studio[];
    },
    enabled: !!user,
  });
}

export function useUpsertStudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: Partial<Studio> & { name: string; slug: string; owner_id: string }) => {
      if (s.id) {
        const { error } = await supabase.from("studios" as any).update(s as any).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("studios" as any).insert(s as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-studios"] }),
  });
}

export function useDeleteStudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("studios" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-studios"] }),
  });
}

export type StudioBooking = {
  id: string;
  studio_id: string;
  owner_id: string;
  booker_user_id: string | null;
  booker_email: string;
  booker_name: string;
  start_at: string;
  end_at: string;
  hours: number;
  total_cents: number;
  platform_fee_cents: number;
  currency: string;
  status: string;
  paddle_transaction_id: string | null;
  notes: string | null;
  created_at: string;
};

export function useOwnerBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["owner-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_bookings" as any)
        .select("*, studios(name, slug)")
        .eq("owner_id", user!.id)
        .order("start_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!user,
  });
}

export function useAdminAllStudios() {
  return useQuery({
    queryKey: ["admin-all-studios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studios" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Studio[];
    },
  });
}

export function useAdminAllBookings() {
  return useQuery({
    queryKey: ["admin-all-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_bookings" as any)
        .select("*, studios(name, slug)")
        .order("start_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}
