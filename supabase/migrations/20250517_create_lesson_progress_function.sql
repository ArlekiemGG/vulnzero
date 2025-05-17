
-- Function to create lesson progress that can handle non-UUID lesson IDs
CREATE OR REPLACE FUNCTION public.create_lesson_progress(
  p_user_id UUID,
  p_lesson_id TEXT,
  p_course_id UUID,
  p_completed BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_normalized_lesson_id UUID;
  v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
  -- Try to convert the lesson ID to UUID if it's not already
  BEGIN
    -- If it's already a valid UUID, use it directly
    v_normalized_lesson_id := p_lesson_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- Otherwise, generate a UUID using MD5 hash
    v_normalized_lesson_id := md5(p_lesson_id)::UUID;
  END;
  
  -- Insert the record with the normalized lesson ID
  INSERT INTO public.user_lesson_progress (
    user_id,
    lesson_id,
    course_id,
    completed,
    completed_at
  ) VALUES (
    p_user_id,
    v_normalized_lesson_id,
    p_course_id,
    p_completed,
    CASE WHEN p_completed THEN v_now ELSE NULL END
  );
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in create_lesson_progress: %', SQLERRM;
  RETURN FALSE;
END;
$$;
