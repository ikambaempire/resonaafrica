import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useAuth } from "@/contexts/AuthContext";

export function usePremiumAccess(podcastId?: string) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !podcastId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("premium_subscriptions")
        .select("status, current_period_end")
        .eq("user_id", user.id)
        .eq("podcast_id", podcastId)
        .eq("environment", getPaddleEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      const end = data?.current_period_end ? new Date(data.current_period_end) : null;
      const future = !end || end > new Date();
      const ok = !!data && future && (
        ["active", "trialing", "past_due"].includes(data.status as string) ||
        (data.status === "canceled" && !!end && end > new Date())
      );
      setIsActive(ok);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id, podcastId]);

  return { isActive, loading };
}
