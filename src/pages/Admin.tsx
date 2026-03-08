import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, LogIn, LogOut, Pencil, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type PostLink = Tables<"post_links">;

const AdminPanel = () => {
  const [session, setSession] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [links, setLinks] = useState<PostLink[]>([]);
  const [loading, setLoading] = useState(true);

  // New link form
  const [newPostUrl, setNewPostUrl] = useState("");
  const [newProductLink, setNewProductLink] = useState("");
  const [newInfluencer, setNewInfluencer] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProductLink, setEditProductLink] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(!!s);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchLinks();
  }, [session]);

  const fetchLinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("post_links")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setLinks(data || []);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const normalizeUrl = (input: string): string => {
    let cleaned = input.trim();
    const urlMatch = cleaned.match(/https?:\/\/(?:www\.)?instagram\.com\/\S+/i);
    if (urlMatch) cleaned = urlMatch[0];
    try {
      const u = new URL(cleaned);
      return `${u.origin}${u.pathname}`.replace(/\/+$/, "");
    } catch {
      return cleaned.replace(/\/+$/, "");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostUrl.trim() || !newProductLink.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("post_links").insert({
      post_url: normalizeUrl(newPostUrl),
      product_link: newProductLink.trim(),
      influencer_name: newInfluencer.trim() || null,
      description: newDescription.trim() || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Link added!");
      setNewPostUrl("");
      setNewProductLink("");
      setNewInfluencer("");
      setNewDescription("");
      fetchLinks();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("post_links").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      setLinks((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const handleSaveEdit = async (id: string) => {
    const { error } = await supabase
      .from("post_links")
      .update({ product_link: editProductLink.trim() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      setEditingId(null);
      fetchLinks();
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold font-display text-center mb-6">Admin Login</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 rounded-xl gradient-warm-bg text-primary-foreground font-semibold font-display shadow-warm hover:scale-105 transition-transform disabled:opacity-50"
          >
            {authLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2"><LogIn className="w-4 h-4" /> Sign In</span>}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-display">Admin Panel</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-card border border-border shadow-card mb-8 space-y-4">
          <h2 className="font-semibold font-display text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Add New Link
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="url"
              placeholder="Instagram Post/Reel URL *"
              value={newPostUrl}
              onChange={(e) => setNewPostUrl(e.target.value)}
              className="px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
            <input
              type="url"
              placeholder="Product/Resource Link *"
              value={newProductLink}
              onChange={(e) => setNewProductLink(e.target.value)}
              className="px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
            <input
              type="text"
              placeholder="Influencer name (optional)"
              value={newInfluencer}
              onChange={(e) => setNewInfluencer(e.target.value)}
              className="px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="px-6 py-3 rounded-xl gradient-warm-bg text-primary-foreground font-semibold font-display shadow-warm hover:scale-105 transition-transform disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Link"}
          </button>
        </form>

        {/* Links table */}
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold font-display">All Links ({links.length})</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : links.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No links yet. Add your first one above.</div>
          ) : (
            <div className="divide-y divide-border">
              {links.map((link) => (
                <div key={link.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{link.post_url}</p>
                    {editingId === link.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="url"
                          value={editProductLink}
                          onChange={(e) => setEditProductLink(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button onClick={() => handleSaveEdit(link.id)} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium truncate text-primary">{link.product_link}</p>
                    )}
                    {link.influencer_name && (
                      <p className="text-xs text-muted-foreground mt-1">by {link.influencer_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <span>{link.lookup_count} lookups</span>
                    <button
                      onClick={() => { setEditingId(link.id); setEditProductLink(link.product_link); }}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
