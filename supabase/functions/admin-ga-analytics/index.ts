import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function b64url(input: ArrayBuffer | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

async function getAccessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${b64url(sig)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Token error: ${JSON.stringify(json)}`);
  return json.access_token;
}

function parseGaError(msg: string): { friendly: string; setupUrl?: string } {
  try {
    const m = msg.match(/\{[\s\S]*\}$/);
    if (!m) return { friendly: msg };
    const j = JSON.parse(m[0]);
    const err = j?.error;
    if (!err) return { friendly: msg };
    if (err.status === "PERMISSION_DENIED" && /has not been used|disabled/i.test(err.message)) {
      const link = err.details?.find((d: any) => d.activationUrl)?.activationUrl
        || err.details?.flatMap((d: any) => d.links || []).find((l: any) => l.url)?.url;
      return {
        friendly: "The Google Analytics Data API is not enabled in your Google Cloud project. Click the link below to enable it (takes ~30 seconds), then refresh.",
        setupUrl: link,
      };
    }
    if (err.status === "PERMISSION_DENIED") {
      return { friendly: "The service account doesn't have access to this GA4 property. In GA4 → Admin → Property Access Management, add the service account email as a Viewer." };
    }
    return { friendly: err.message || msg };
  } catch {
    return { friendly: msg };
  }
}

async function runReport(propertyId: string, token: string, body: unknown) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`GA error: ${JSON.stringify(json)}`);
  return json;
}

async function runRealtime(propertyId: string, token: string) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ metrics: [{ name: "activeUsers" }] }),
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`GA error: ${JSON.stringify(json)}`);
  return json;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return respond({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: cErr } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (cErr || !claims?.claims) return respond({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) return respond({ error: "Forbidden" }, 403);

    const propertyId = Deno.env.get("GA4_PROPERTY_ID")!;
    const sa = JSON.parse(Deno.env.get("GA4_SERVICE_ACCOUNT_JSON")!);
    const token = await getAccessToken(sa);

    const body = await req.json().catch(() => ({}));
    if (body?.realtimeOnly) {
      const activeNow = await runRealtime(propertyId, token);
      return respond({ activeNow });
    }

    const dateRanges = [{ startDate: "30daysAgo", endDate: "today" }];

    const [summary, byDay, topPages, sources, countries, devices, activeNow] = await Promise.all([
      runReport(propertyId, token, {
        dateRanges,
        metrics: [
          { name: "activeUsers" }, { name: "newUsers" }, { name: "sessions" },
          { name: "screenPageViews" }, { name: "averageSessionDuration" }, { name: "bounceRate" },
        ],
      }),
      runReport(propertyId, token, {
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      runReport(propertyId, token, {
        dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      runReport(propertyId, token, {
        dateRanges,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      runReport(propertyId, token, {
        dateRanges,
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      }),
      runReport(propertyId, token, {
        dateRanges,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
      }),
      runRealtime(propertyId, token),
    ]);

    return respond({ summary, byDay, topPages, sources, countries, devices, activeNow });
  } catch (e) {
    const raw = (e as Error).message;
    console.error("admin-ga-analytics error:", raw);
    const { friendly, setupUrl } = parseGaError(raw);
    return respond({ error: friendly, setupUrl, raw }, 200);
  }
});
