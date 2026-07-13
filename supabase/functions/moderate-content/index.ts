import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { fileUrl, fileType } = await req.json();

    if (!fileUrl) {
      return new Response(
        JSON.stringify({ error: "fileUrl required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiUser = Deno.env.get("SIGHTENGINE_API_USER");
    const apiSecret = Deno.env.get("SIGHTENGINE_API_SECRET");

    if (!apiUser || !apiSecret) {
      console.error("Sightengine credentials not configured");
      // Fail open — don't block upload if credentials missing
      return new Response(
        JSON.stringify({ approved: true, reason: "moderation_skipped_no_credentials" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const isVideo = fileType?.startsWith("video/");

    // Video moderation is skipped for now — only image moderation
    if (isVideo) {
      return new Response(
        JSON.stringify({ approved: true, reason: "video_moderation_skipped" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Image moderation via Sightengine
    const params = new URLSearchParams({
      url: fileUrl,
      models: "nudity-2.1,offensive",
      api_user: apiUser,
      api_secret: apiSecret,
    });

    const sightRes = await fetch(
      `https://api.sightengine.com/1.0/check.json?${params.toString()}`,
      { method: "GET" },
    );

    if (!sightRes.ok) {
      const errText = await sightRes.text();
      console.error("Sightengine API error:", sightRes.status, errText);
      // Fail open on API error — don't block upload
      return new Response(
        JSON.stringify({ approved: true, reason: "moderation_api_error" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = await sightRes.json();

    // Check nudity score
    const nudityScore: number =
      result?.nudity?.sexual_activity ??
      result?.nudity?.sexual_display ??
      result?.nudity?.erotica ??
      0;

    // Check offensive score
    const offensiveScore: number = result?.offensive?.prob ?? 0;

    const THRESHOLD = 0.5;
    const blocked = nudityScore > THRESHOLD || offensiveScore > THRESHOLD;

    if (blocked) {
      return new Response(
        JSON.stringify({
          approved: false,
          reason: nudityScore > THRESHOLD ? "nudity" : "offensive",
          nudityScore,
          offensiveScore,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ approved: true, nudityScore, offensiveScore }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("moderate-content error:", err);
    // Fail open — don't block upload on unexpected error
    return new Response(
      JSON.stringify({ approved: true, reason: "moderation_exception" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
