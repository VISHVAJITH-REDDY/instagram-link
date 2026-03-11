
CREATE TABLE public.web_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_url TEXT NOT NULL,
  requester_ip TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.web_requests ENABLE ROW LEVEL SECURITY;

-- Anon can insert requests
CREATE POLICY "Anon can insert web_requests"
  ON public.web_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon can read requests
CREATE POLICY "Anon can select web_requests"
  ON public.web_requests
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated can update requests
CREATE POLICY "Authenticated can update web_requests"
  ON public.web_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated can do everything
CREATE POLICY "Authenticated full access web_requests"
  ON public.web_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable realtime on post_links
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_links;
