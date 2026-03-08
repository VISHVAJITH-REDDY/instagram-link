
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can look up post links" ON public.post_links;
DROP POLICY IF EXISTS "Authenticated users can delete post links" ON public.post_links;
DROP POLICY IF EXISTS "Authenticated users can insert post links" ON public.post_links;
DROP POLICY IF EXISTS "Authenticated users can update post links" ON public.post_links;

CREATE POLICY "Anyone can look up post links"
  ON public.post_links FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert post links"
  ON public.post_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update post links"
  ON public.post_links FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete post links"
  ON public.post_links FOR DELETE
  TO authenticated
  USING (true);
