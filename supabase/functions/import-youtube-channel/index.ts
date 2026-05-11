// Resolve a YouTube channel/handle URL and either:
//  - action=list: return the latest 25 videos from the uploads playlist
//  - action=import: insert selected videos as episodes for the caller
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YT = "https://www.googleapis.com/youtube/v3";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) || `ep-${Date.now()}`;
}

async function resolveChannelId(input: string, key: string): Promise<{ channelId: string; title: string; handle?: string }> {
  // Accept: channel ID (UC...), @handle, full URL with /channel/UC..., /@handle, /c/Name, /user/Name
  const trimmed = input.trim();
  let m;
  if ((m = trimmed.match(/^(UC[\w-]{20,})$/))) {
    return await fetchChannelById(m[1], key);
  }
  if ((m = trimmed.match(/youtube\.com\/channel\/(UC[\w-]{20,})/))) {
    return await fetchChannelById(m[1], key);
  }
  let handle: string | undefined;
  if ((m = trimmed.match(/^@([\w.\-]+)$/))) handle = m[1];
  else if ((m = trimmed.match(/youtube\.com\/@([\w.\-]+)/))) handle = m[1];
  else if ((m = trimmed.match(/youtube\.com\/(?:c|user)\/([\w.\-]+)/))) handle = m[1];

  if (handle) {
    // Try forHandle first (newer API)
    const r1 = await fetch(`${YT}/channels?part=snippet&forHandle=${handle}&key=${key}`);
    const j1 = await r1.json();
    if (j1.items?.length) return { channelId: j1.items[0].id, title: j1.items[0].snippet.title, handle };
    // Fallback: search
    const r2 = await fetch(`${YT}/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&maxResults=1&key=${key}`);
    const j2 = await r2.json();
    if (j2.items?.length) return { channelId: j2.items[0].snippet.channelId, title: j2.items[0].snippet.title, handle };
  }
  throw new Error("Could not resolve YouTube channel from input.");
}

async function fetchChannelById(channelId: string, key: string) {
  const r = await fetch(`${YT}/channels?part=snippet&id=${channelId}&key=${key}`);
  const j = await r.json();
  if (!j.items?.length) throw new Error("Channel not found");
  return { channelId, title: j.items[0].snippet.title };
}

async function listVideos(channelId: string, key: string, max = 25) {
  // Get uploads playlist
  const r1 = await fetch(`${YT}/channels?part=contentDetails&id=${channelId}&key=${key}`);
  const j1 = await r1.json();
  const uploads = j1.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("No uploads playlist");
  const r2 = await fetch(`${YT}/playlistItems?part=snippet,contentDetails&playlistId=${uploads}&maxResults=${max}&key=${key}`);
  const j2 = await r2.json();
  return (j2.items || []).map((it: any) => ({
    videoId: it.contentDetails.videoId,
    title: it.snippet.title,
    description: it.snippet.description,
    thumbnail: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.default?.url,
    publishedAt: it.contentDetails.videoPublishedAt || it.snippet.publishedAt,
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json();
    const action = body.action as "list" | "import";

    if (action === "list") {
      const channel = await resolveChannelId(String(body.channelInput || ""), YOUTUBE_API_KEY);
      const videos = await listVideos(channel.channelId, YOUTUBE_API_KEY);
      return new Response(JSON.stringify({ channel, videos }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "import") {
      const podcastId = String(body.podcastId || "");
      const channelId = String(body.channelId || "");
      const handle = body.handle ? String(body.handle) : null;
      const videos: { videoId: string; title: string; description?: string; thumbnail?: string; publishedAt?: string }[] = body.videos || [];

      if (!podcastId || !videos.length) throw new Error("Missing podcastId or videos");

      // Verify ownership
      const { data: pod, error: podErr } = await userClient.from("podcasts").select("id,owner_id").eq("id", podcastId).single();
      if (podErr || !pod || pod.owner_id !== userId) throw new Error("Podcast not found or not owned by user");

      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

      let inserted = 0;
      for (const v of videos) {
        const { error: insErr } = await admin.from("episodes").insert({
          podcast_id: podcastId,
          owner_id: userId,
          title: v.title,
          slug: `${slugify(v.title)}-${v.videoId.slice(0, 6)}`,
          description: v.description || null,
          cover_url: v.thumbnail || null,
          hosting: "embed",
          embed_provider: "youtube",
          embed_url: `https://www.youtube.com/watch?v=${v.videoId}`,
          youtube_video_id: v.videoId,
          status: "published",
          published_at: v.publishedAt || new Date().toISOString(),
        });
        if (!insErr) inserted++;
      }

      // Record integration
      await admin.from("creator_integrations").upsert({
        user_id: userId,
        provider: "youtube",
        external_id: channelId,
        handle,
        metadata: { last_imported_count: inserted },
        last_sync_at: new Date().toISOString(),
      }, { onConflict: "user_id,provider" });

      return new Response(JSON.stringify({ ok: true, inserted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Unknown action");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("import-youtube-channel error:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
