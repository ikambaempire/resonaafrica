// Cron-eligible: publishes any episodes whose status='scheduled' and scheduled_at<=now.
// Safe to call publicly because it only flips status when the schedule is due.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const now = new Date().toISOString();

  const { data: due, error } = await supabase
    .from("episodes")
    .select("id")
    .eq("status", "scheduled")
    .lte("scheduled_at", now);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

  if (due && due.length) {
    await supabase
      .from("episodes")
      .update({ status: "published", published_at: now })
      .in("id", due.map((d) => d.id));
  }

  return new Response(JSON.stringify({ published: due?.length || 0 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
