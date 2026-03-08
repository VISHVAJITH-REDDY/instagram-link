import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);

    // GET /lookup-link?post_url=...
    if (req.method === "GET") {
      const postUrl = url.searchParams.get("post_url");
      if (!postUrl) {
        return new Response(JSON.stringify({ error: "post_url parameter required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const normalized = normalizeUrl(postUrl);
      const { data, error } = await supabase
        .from("post_links")
        .select("product_link, influencer_name, description")
        .eq("post_url", normalized)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Increment counter
        await supabase.rpc("increment_lookup_count_by_url", { url_param: normalized });
        return new Response(JSON.stringify({ found: true, ...data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ found: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /lookup-link { post_url, product_link, influencer_name? }
    if (req.method === "POST") {
      const body = await req.json();
      const { post_url, product_link, influencer_name, description } = body;

      if (!post_url || !product_link) {
        return new Response(JSON.stringify({ error: "post_url and product_link required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("post_links").upsert(
        {
          post_url: normalizeUrl(post_url),
          product_link,
          influencer_name: influencer_name || null,
          description: description || null,
        },
        { onConflict: "post_url" }
      );

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function normalizeUrl(input: string): string {
  let cleaned = input.trim();
  const urlMatch = cleaned.match(/https?:\/\/(?:www\.)?instagram\.com\/\S+/i);
  if (urlMatch) cleaned = urlMatch[0];
  try {
    const u = new URL(cleaned);
    return `${u.origin}${u.pathname}`.replace(/\/+$/, "");
  } catch {
    return cleaned.replace(/\/+$/, "");
  }
}
