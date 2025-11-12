CREATE OR REPLACE FUNCTION public.refresh_postgrest()
RETURNS void AS $$
  SELECT pg_notify('pgrst', 'reload schema');
$$ LANGUAGE sql SECURITY DEFINER;
