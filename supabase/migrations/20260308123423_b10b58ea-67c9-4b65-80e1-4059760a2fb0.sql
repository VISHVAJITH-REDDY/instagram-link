-- Create table for storing Instagram post-to-link mappings
CREATE TABLE public.post_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_url TEXT NOT NULL,
  product_link TEXT NOT NULL,
  influencer_name TEXT,
  description TEXT,
  lookup_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on post_url for fast lookups
CREATE UNIQUE INDEX idx_post_links_post_url ON public.post_links (post_url);

-- Enable RLS
ALTER TABLE public.post_links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read post links (public lookup)
CREATE POLICY "Anyone can look up post links"
  ON public.post_links FOR SELECT
  USING (true);

-- Only authenticated users can insert (admin)
CREATE POLICY "Authenticated users can insert post links"
  ON public.post_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update post links"
  ON public.post_links FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete post links"
  ON public.post_links FOR DELETE
  TO authenticated
  USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_post_links_updated_at
  BEFORE UPDATE ON public.post_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();