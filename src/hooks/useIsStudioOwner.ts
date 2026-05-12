import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsStudioOwner() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-studio-owner", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "studio_owner" as any)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });
}
