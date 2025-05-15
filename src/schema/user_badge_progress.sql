
-- Esta tabla almacena el progreso de los usuarios en insignias
CREATE TABLE IF NOT EXISTS public.user_badge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  earned BOOLEAN NOT NULL DEFAULT false,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Aplicar RLS para que cada usuario solo pueda ver su propio progreso
ALTER TABLE public.user_badge_progress ENABLE ROW LEVEL SECURITY;

-- Política para que cada usuario pueda ver su propio progreso
CREATE POLICY "Users can view their own badge progress" 
ON public.user_badge_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para que cada usuario pueda actualizar su propio progreso
CREATE POLICY "Users can update their own badge progress" 
ON public.user_badge_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para que cada usuario pueda insertar su propio progreso
CREATE POLICY "Users can insert their own badge progress" 
ON public.user_badge_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para el servicio del sistema para poder actualizar datos del usuario (sin requerir autenticación)
CREATE POLICY "Service can access all badge progress" 
ON public.user_badge_progress 
USING (true);

-- Creación de un trigger para actualizar el timestamp de actualización
CREATE OR REPLACE FUNCTION public.update_user_badge_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_badge_progress_updated_at
BEFORE UPDATE ON public.user_badge_progress
FOR EACH ROW
EXECUTE PROCEDURE public.update_user_badge_progress_updated_at();
