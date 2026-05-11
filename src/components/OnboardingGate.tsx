import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const EXEMPT_PREFIXES = ["/onboarding", "/auth", "/u/"];

/** Redirects logged-in users to /onboarding if their profile setup is incomplete. */
export function OnboardingGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [checked, setChecked] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    if (checked === user.id) return;
    if (EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return;

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_setup_complete")
        .eq("id", user.id)
        .maybeSingle();
      setChecked(user.id);
      if (data && (data as any).is_setup_complete === false) {
        navigate("/onboarding", { replace: true });
      }
    })();
  }, [user, loading, pathname, navigate, checked]);

  return null;
}
