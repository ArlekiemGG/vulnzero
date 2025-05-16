
-- Adición de columnas para el sistema de onboarding y rutas de aprendizaje
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_level text,
ADD COLUMN IF NOT EXISTS recommended_course text,
ADD COLUMN IF NOT EXISTS completed_assessment boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS learning_path_id uuid;

-- Crear tabla para las rutas de aprendizaje
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    level text NOT NULL,
    course_ids text[] NOT NULL DEFAULT '{}'::text[],
    prerequisites text[] NOT NULL DEFAULT '{}'::text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Mejorar la estructura de insignias y logros
CREATE TABLE IF NOT EXISTS public.achievement_types (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Añadir referencia de tipo de logro a la tabla de badges
ALTER TABLE public.badges
ADD COLUMN IF NOT EXISTS achievement_type_id uuid,
ADD CONSTRAINT badges_achievement_type_id_fkey
    FOREIGN KEY (achievement_type_id)
    REFERENCES public.achievement_types(id)
    ON DELETE SET NULL;

-- Activar seguridad de nivel de fila para las nuevas tablas
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

-- Crear políticas para la tabla learning_paths
CREATE POLICY "Todos pueden ver rutas de aprendizaje" 
    ON public.learning_paths FOR SELECT 
    USING (true);

CREATE POLICY "Solo administradores pueden modificar rutas de aprendizaje" 
    ON public.learning_paths 
    FOR ALL 
    USING (is_admin(auth.uid()));
