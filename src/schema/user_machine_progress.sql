
-- Esta tabla almacena el progreso del usuario en las máquinas
CREATE TABLE IF NOT EXISTS public.user_machine_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  machine_id TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  flags TEXT[] DEFAULT '{}',
  completed_tasks INTEGER[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (user_id, machine_id)
);

-- Aplicar RLS para que cada usuario solo pueda ver su propio progreso
ALTER TABLE public.user_machine_progress ENABLE ROW LEVEL SECURITY;

-- Política para que cada usuario pueda ver su propio progreso
CREATE POLICY "Users can view their own progress" 
ON public.user_machine_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para que cada usuario pueda actualizar su propio progreso
CREATE POLICY "Users can update their own progress" 
ON public.user_machine_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para que cada usuario pueda insertar su propio progreso
CREATE POLICY "Users can insert their own progress" 
ON public.user_machine_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
