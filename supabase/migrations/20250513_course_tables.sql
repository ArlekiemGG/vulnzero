
-- This migration assumes the core tables are already created
-- It just adds the is_admin function if it doesn't exist

-- Create the is_admin function (skips if it already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO ''public''
      AS $function$
      BEGIN
        -- Logic to verify if a user is an administrator
        RETURN EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = user_id 
          AND role = ''admin''
        );
      END;
      $function$;
    ';
  END IF;
END
$$;

-- Ensure Row Level Security (RLS) is enabled for all relevant tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for the course tables to allow public reading
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Courses are viewable by everyone') THEN
    CREATE POLICY "Courses are viewable by everyone"
      ON public.courses
      FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'course_sections' AND policyname = 'Course sections are viewable by everyone') THEN
    CREATE POLICY "Course sections are viewable by everyone"
      ON public.course_sections
      FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'course_lessons' AND policyname = 'Course lessons are viewable by everyone') THEN
    CREATE POLICY "Course lessons are viewable by everyone"
      ON public.course_lessons
      FOR SELECT
      USING (true);
  END IF;
  
  -- User progress policies - users can only see their own progress
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_course_progress' AND policyname = 'Users can view their own course progress') THEN
    CREATE POLICY "Users can view their own course progress"
      ON public.user_course_progress
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_lesson_progress' AND policyname = 'Users can view their own lesson progress') THEN
    CREATE POLICY "Users can view their own lesson progress"
      ON public.user_lesson_progress
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  -- Users can insert and update their own progress
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_course_progress' AND policyname = 'Users can insert their own course progress') THEN
    CREATE POLICY "Users can insert their own course progress"
      ON public.user_course_progress
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_lesson_progress' AND policyname = 'Users can insert their own lesson progress') THEN
    CREATE POLICY "Users can insert their own lesson progress"
      ON public.user_lesson_progress
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_course_progress' AND policyname = 'Users can update their own course progress') THEN
    CREATE POLICY "Users can update their own course progress"
      ON public.user_course_progress
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_lesson_progress' AND policyname = 'Users can update their own lesson progress') THEN
    CREATE POLICY "Users can update their own lesson progress"
      ON public.user_lesson_progress
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END
$$;
