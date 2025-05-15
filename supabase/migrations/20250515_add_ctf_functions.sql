
-- Function to check if a user is registered for a CTF
CREATE OR REPLACE FUNCTION public.is_registered_for_ctf(p_user_id UUID, p_ctf_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.ctf_registrations 
    WHERE user_id = p_user_id 
    AND ctf_id = p_ctf_id
  );
END;
$$;

-- Function to register a user for a CTF
CREATE OR REPLACE FUNCTION public.register_for_ctf(p_user_id UUID, p_ctf_id INTEGER)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_registration_id UUID;
BEGIN
  -- Check if already registered
  IF EXISTS (
    SELECT 1 
    FROM public.ctf_registrations 
    WHERE user_id = p_user_id 
    AND ctf_id = p_ctf_id
  ) THEN
    SELECT id INTO v_registration_id
    FROM public.ctf_registrations
    WHERE user_id = p_user_id 
    AND ctf_id = p_ctf_id;
    
    RETURN v_registration_id;
  END IF;
  
  -- Insert new registration
  INSERT INTO public.ctf_registrations (user_id, ctf_id)
  VALUES (p_user_id, p_ctf_id)
  RETURNING id INTO v_registration_id;
  
  RETURN v_registration_id;
END;
$$;

-- Function to get a user's CTF registrations
CREATE OR REPLACE FUNCTION public.get_user_ctf_registrations(p_user_id UUID)
RETURNS SETOF public.ctf_registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.ctf_registrations
  WHERE user_id = p_user_id;
END;
$$;
