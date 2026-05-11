import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const YT_KEY = Deno.env.get("YOUTUBE_API_KEY");

async function resolveChannelId(input: string): Promise<string | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^UC[A-Za-z0-9_-]{20,}$/.test(trimmed)) return trimmed;

  let handle = trimmed;
  try {
    if (trimmed.startsWith("http")) {
      const u = new URL(trimmed);
      const parts = u.pathname.split("/").filter(Boolean);
      const ci = parts.indexOf("channel");
      if (ci >= 0 && parts[ci + 1]) return parts[ci + 1];
      const hPart = parts.find((p) => p.startsWith("@")) || parts[parts.length - 1];
      handle = hPart;
    }
  } catch { /* ignore */ }
  if (handle.startsWith("@")) handle = handle.slice(1);

  const r = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(handle)}&key=${YT_KEY}`,
  );
  const j = await r.json();
  return j.items?.[0]?.snippet?.channelId ?? j.items?.[0]?.id?.channelId ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!YT_KEY) throw new Error("YOUTUBE_API_KEY not configured");
    const { input } = await req.json().catch(() => ({}));
    if (!input || typeof input !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'input' (channel ID, @handle, or URL)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const channelId = await resolveChannelId(input);
    if (!channelId) {
      return new Response(JSON.stringify({ error: "Could not resolve channel" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YT_KEY}`,
    );
    const cJson = await cRes.json();
    const ch = cJson.items?.[0];
    if (!ch) {
      return new Response(JSON.stringify({ error: "Channel not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const uploadsId = ch.contentDetails?.relatedPlaylists?.uploads;
    let videos: any[] = [];
    if (uploadsId) {
      const pRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=5&playlistId=${uploadsId}&key=${YT_KEY}`,
      );
      const pJson = await pRes.json();
      const ids = (pJson.items || []).map((it: any) => it.contentDetails?.videoId).filter(Boolean);
      if (ids.length) {
        const vRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(",")}&key=${YT_KEY}`,
        );
        const vJson = await vRes.json();
        videos = (vJson.items || []).map((v: any) => ({
          id: v.id,
          title: v.snippet?.title,
          thumbnail: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url,
          publishedAt: v.snippet?.publishedAt,
          views: Number(v.statistics?.viewCount || 0),
          likes: Number(v.statistics?.likeCount || 0),
          comments: Number(v.statistics?.commentCount || 0),
          url: `https://www.youtube.com/watch?v=${v.id}`,
        }));
      }
    }

    return new Response(JSON.stringify({
      channel: {
        id: channelId,
        title: ch.snippet?.title,
        description: ch.snippet?.description,
        customUrl: ch.snippet?.customUrl,
        thumbnail: ch.snippet?.thumbnails?.medium?.url || ch.snippet?.thumbnails?.default?.url,
        publishedAt: ch.snippet?.publishedAt,
        country: ch.snippet?.country,
      },
      stats: {
        subscribers: Number(ch.statistics?.subscriberCount || 0),
        views: Number(ch.statistics?.viewCount || 0),
        videos: Number(ch.statistics?.videoCount || 0),
      },
      latest: videos,
      fetchedAt: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
