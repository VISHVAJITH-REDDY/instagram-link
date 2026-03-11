
CREATE TABLE public.pending_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_url TEXT NOT NULL,
  requester_instagram_username TEXT NOT NULL,
  creator_username TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_pending_requests_creator ON public.pending_requests (creator_username, status);
CREATE INDEX idx_pending_requests_post_url ON public.pending_requests (post_url, status);

ALTER TABLE public.pending_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated only on pending_requests"
  ON public.pending_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_pending_requests_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'fulfilled', 'failed') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be pending, fulfilled, or failed.', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_pending_requests_status
  BEFORE INSERT OR UPDATE ON public.pending_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_pending_requests_status();

-- Anon users can insert requests (public facing)
CREATE POLICY "Anon can insert pending_requests"
  ON public.pending_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.fulfill_pending_requests(url_param TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.pending_requests
  SET status = 'fulfilled'
  WHERE post_url = url_param AND status = 'pending';
$$;
