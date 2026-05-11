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
      // Skip for admins so they aren't forced through the wizard
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isAdmin = (roles || []).some((r: any) => r.role === "admin");
      if (isAdmin) { setChecked(user.id); return; }

      const { data } = await supabase
        .from("profiles")
        .select("is_setup_complete, username")
        .eq("id", user.id)
        .maybeSingle();
      setChecked(user.id);
      // Only redirect if profile row exists AND user hasn't picked a handle yet
      if (data && !(data as any).username && (data as any).is_setup_complete === false) {
        navigate("/onboarding", { replace: true });
      }
    })();
  }, [user, loading, pathname, navigate, checked]);

  return null;
}
