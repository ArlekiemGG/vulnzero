
-- Create or replace the increment function
CREATE OR REPLACE FUNCTION public.increment(row_id uuid, value integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET points = points + value
  WHERE id = row_id;
END;
$$;
