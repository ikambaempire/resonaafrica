// Generates a timestamped transcript outline + 3-5 short-clip suggestions with start/end seconds.
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

    const { episodeId, userPrompt } = await req.json();
    if (!episodeId) return json({ error: "episodeId required" }, 400);

    const { data: ep, error: epErr } = await supabase.from("episodes").select("*").eq("id", episodeId).maybeSingle();
    if (epErr || !ep) return json({ error: "Episode not found" }, 404);
    if (ep.owner_id !== userRes.user.id) return json({ error: "Forbidden" }, 403);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const durationSec = Math.max(60, Number(ep.duration_seconds) || 1800); // default 30 min
    const userGuidance = (userPrompt && String(userPrompt).trim().length > 0)
      ? `\n\nCREATOR GUIDANCE (PRIORITIZE THIS): ${String(userPrompt).trim()}\nFocus the clip selection and chapter highlights on this guidance.`
      : "";
    const prompt = `You are an assistant for podcast creators. Based on this episode, produce a transcript-style chapter outline with timestamps and 4 viral short-clip ideas with timestamps.

Episode title: ${ep.title}
Description: ${ep.description ?? "(none)"}
Total estimated duration (seconds): ${durationSec}${userGuidance}

Rules:
- Distribute timestamps across the FULL duration (do not bunch them at the start).
- All timestamps must be integer seconds, 0 <= t <= ${durationSec}.
- Clip duration (end - start) must be 20-90 seconds.
- Return ONLY valid JSON via the tool call.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You return only structured tool calls." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "build_clips",
            description: "Return chapter outline + clip suggestions with timestamps.",
            parameters: {
              type: "object",
              properties: {
                chapters: {
                  type: "array",
                  description: "6-10 chapter markers spanning the episode.",
                  items: {
                    type: "object",
                    properties: {
                      timestamp_seconds: { type: "number" },
                      title: { type: "string" },
                      summary: { type: "string" },
                    },
                    required: ["timestamp_seconds", "title", "summary"],
                  },
                },
                clips: {
                  type: "array",
                  description: "4 short viral clip suggestions.",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      hook: { type: "string" },
                      start_seconds: { type: "number" },
                      end_seconds: { type: "number" },
                    },
                    required: ["title", "hook", "start_seconds", "end_seconds"],
                  },
                },
              },
              required: ["chapters", "clips"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "build_clips" } },
      }),
    });
    if (!aiRes.ok) {
      if (aiRes.status === 429) return json({ error: "Rate limit reached, try again in a moment." }, 429);
      if (aiRes.status === 402) return json({ error: "AI credits exhausted. Add credits in Workspace > Usage." }, 402);
      const t = await aiRes.text();
      return json({ error: `AI gateway error: ${aiRes.status}`, detail: t }, 500);
    }
    const aiJson = await aiRes.json();
    const args = aiJson.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}";
    let parsed: { chapters?: { timestamp_seconds: number; title: string; summary: string }[]; clips?: { title: string; hook: string; start_seconds: number; end_seconds: number }[] } = {};
    try { parsed = typeof args === "string" ? JSON.parse(args) : args; } catch { parsed = {}; }

    const transcriptText = (parsed.chapters || []).map((c) => {
      const m = Math.floor(c.timestamp_seconds / 60);
      const s = Math.floor(c.timestamp_seconds % 60).toString().padStart(2, "0");
      return `[${m}:${s}] ${c.title} — ${c.summary}`;
    }).join("\n");

    const { error: updErr } = await supabase
      .from("episodes")
      .update({
        transcript: transcriptText || ep.transcript,
        ai_clips: parsed.clips ?? [],
      })
      .eq("id", episodeId);
    if (updErr) return json({ error: updErr.message }, 500);

    return json({ ok: true, transcript: transcriptText, chapters: parsed.chapters, clips: parsed.clips });
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
