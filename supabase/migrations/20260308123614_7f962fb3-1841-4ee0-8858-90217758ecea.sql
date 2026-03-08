CREATE OR REPLACE FUNCTION public.increment_lookup_count_by_url(url_param TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.post_links
  SET lookup_count = lookup_count + 1
  WHERE post_url = url_param;
$$;