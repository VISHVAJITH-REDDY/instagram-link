import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Link, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LinkLookup = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ product_link: string; influencer_name: string | null } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const normalizeUrl = (input: string): string => {
    let cleaned = input.trim();
    // Extract URL from Instagram share text
    const urlMatch = cleaned.match(/https?:\/\/(?:www\.)?instagram\.com\/\S+/i);
    if (urlMatch) cleaned = urlMatch[0];
    // Remove query params and trailing slashes
    try {
      const u = new URL(cleaned);
      return `${u.origin}${u.pathname}`.replace(/\/+$/, "");
    } catch {
      return cleaned.replace(/\/+$/, "");
    }
  };

  const handleLookup = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    setError("");

    try {
      const normalized = normalizeUrl(url);
      const { data, error: dbError } = await supabase
        .from("post_links")
        .select("product_link, influencer_name")
        .eq("post_url", normalized)
        .maybeSingle();

      if (dbError) throw dbError;

      if (data) {
        setResult(data);
        // Increment lookup count (fire and forget)
        supabase.rpc("increment_lookup_count" as never, { url: normalized } as never).then();
      } else {
        setNotFound(true);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-3">
            Paste the <span className="gradient-text">reel or post</span> URL
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            We'll find the product link for you instantly.
          </p>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={loading || !url.trim()}
              className="px-6 py-4 rounded-xl gradient-warm-bg text-primary-foreground font-semibold font-display shadow-warm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Find"}
            </button>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl bg-card border border-primary/20 shadow-card"
            >
              <div className="flex items-center gap-2 mb-3">
                <Link className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {result.influencer_name ? `From ${result.influencer_name}` : "Product Link Found"}
                </span>
              </div>
              <a
                href={result.product_link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-lg font-semibold text-primary hover:underline break-all"
              >
                {result.product_link}
                <ExternalLink className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </motion.div>
          )}

          {/* Not found */}
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">Link not in our database yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try sending this reel to our Instagram DM — we'll extract it and add it for everyone.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default LinkLookup;
