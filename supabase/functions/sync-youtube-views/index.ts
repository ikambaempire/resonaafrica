// Hourly job: refresh YouTube view counts for all episodes with a youtube_video_id.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY not configured");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rows, error } = await admin
      .from("episodes")
      .select("id, youtube_video_id")
      .not("youtube_video_id", "is", null)
      .order("youtube_views_synced_at", { ascending: true, nullsFirst: true })
      .limit(200);
    if (error) throw error;

    let updated = 0;
    // YouTube allows up to 50 IDs per call
    for (let i = 0; i < (rows?.length || 0); i += 50) {
      const batch = rows!.slice(i, i + 50);
      const ids = batch.map((r) => r.youtube_video_id).join(",");
      const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${YOUTUBE_API_KEY}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        console.error("YouTube API error", resp.status, await resp.text());
        continue;
      }
      const json = await resp.json();
      const map = new Map<string, number>();
      for (const item of json.items || []) {
        map.set(item.id, Number(item.statistics?.viewCount || 0));
      }
      const now = new Date().toISOString();
      for (const r of batch) {
        const views = map.get(r.youtube_video_id!) ?? 0;
        await admin.from("episodes")
          .update({ youtube_views: views, youtube_views_synced_at: now })
          .eq("id", r.id);
        updated++;
      }
    }

    return new Response(JSON.stringify({ ok: true, updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("sync-youtube-views error:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
