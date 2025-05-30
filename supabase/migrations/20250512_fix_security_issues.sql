
-- Fix for Issue 1: Function Search Path Mutable
-- Modify the handle_new_user function to explicitly set search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  badge_id UUID;
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' || new.id);
  
  -- Initialize badge progress for new user
  FOR badge_id IN SELECT id FROM public.badges LOOP
    INSERT INTO public.user_badge_progress (user_id, badge_id, current_progress, earned)
    VALUES (new.id, badge_id, 0, false);
  END LOOP;
  
  RETURN new;
END;
$function$;

-- Create the trigger if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- Note: You'll need to run this SQL in the Supabase SQL Editor
