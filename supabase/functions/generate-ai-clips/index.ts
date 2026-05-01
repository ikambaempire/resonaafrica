// Generates a transcript-like outline + 3 short-clip suggestions for an episode using Lovable AI Gateway.
// Owner-only. Updates episodes.transcript and episodes.ai_clips.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) return json({ error: "Unauthorized" }, 401);

    const { episodeId } = await req.json();
    if (!episodeId) return json({ error: "episodeId required" }, 400);

    const { data: ep, error: epErr } = await supabase.from("episodes").select("*").eq("id", episodeId).maybeSingle();
    if (epErr || !ep) return json({ error: "Episode not found" }, 404);
    if (ep.owner_id !== userRes.user.id) return json({ error: "Forbidden" }, 403);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const prompt = `You are an assistant for podcast creators. Based on this episode title and description, produce a JSON object with two keys:
- "transcript_outline": a 6-10 line outline (one bullet per line) capturing the likely narrative arc.
- "clips": an array of 3 short-clip suggestions, each with "title" (max 60 chars), "hook" (one sentence), "suggested_duration_seconds" (15-90).
Return ONLY valid JSON.

Episode title: ${ep.title}
Description: ${ep.description ?? "(none)"}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return json({ error: `AI gateway error: ${aiRes.status}`, detail: t }, 500);
    }
    const aiJson = await aiRes.json();
    const content: string = aiJson.choices?.[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/^```json\s*|\s*```$/g, "").trim();
    let parsed: { transcript_outline?: string; clips?: unknown[] } = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { transcript_outline: content, clips: [] };
    }

    const { error: updErr } = await supabase
      .from("episodes")
      .update({
        transcript: parsed.transcript_outline ?? ep.transcript,
        ai_clips: parsed.clips ?? [],
      })
      .eq("id", episodeId);
    if (updErr) return json({ error: updErr.message }, 500);

    return json({ ok: true, transcript: parsed.transcript_outline, clips: parsed.clips });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
