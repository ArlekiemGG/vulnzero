
-- Fix for Issue 1: Function Search Path Mutable
-- Modify the handle_new_user function to explicitly set search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' || new.id);
  RETURN new;
END;
$function$;

-- Note: You'll need to run this SQL in the Supabase SQL Editor
