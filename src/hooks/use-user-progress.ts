
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Definimos los tipos necesarios
export interface UserStats {
  points: number;
  level: number;
  rank: number;
  solved_machines: number;
  completed_courses: number;
  completed_lessons: number;
  earned_badges: number;
  
  // Propiedades adicionales para compatibilidad con el código existente
  pointsToNextLevel?: number;
  progress?: number;
  solvedMachines?: number;
  completedChallenges?: number;
}

export interface DetailedProgress {
  machine_progress: Array<{
    machine_id: string;
    progress: number;
    completed: boolean;
    hours_taken: number | null;
  }>;
  course_progress: Array<{
    course_id: string;
    progress_percentage: number;
    completed: boolean;
  }>;
  badge_progress: Array<{
    badge_id: string;
    current_progress: number;
    earned: boolean;
    earned_at: string | null;
  }>;
  recent_activities: Array<{
    title: string;
    type: string;
    points: number;
    created_at: string;
  }>;
}

export interface UserProgress {
  user_stats: UserStats;
  detailed_progress: DetailedProgress;
}

const CACHE_KEY = 'vulnzero_user_progress';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos en milisegundos

export const useUserProgress = () => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Función para cargar el progreso desde la caché local
  const loadFromCache = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (!cachedData) return null;
      
      const { data, timestamp } = JSON.parse(cachedData);
      
      // Verificar si la caché ha expirado
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data as UserProgress;
    } catch (err) {
      console.error('Error cargando la caché del progreso:', err);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  // Función para guardar el progreso en la caché local
  const saveToCache = useCallback((data: UserProgress) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Error guardando la caché del progreso:', err);
    }
  }, []);

  // Función para obtener el progreso del usuario desde Supabase
  const fetchUserProgress = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Intentar cargar desde caché si no se fuerza actualización
      if (!forceRefresh) {
        const cachedProgress = loadFromCache();
        if (cachedProgress) {
          console.log('Progreso cargado desde caché local');
          setUserProgress(cachedProgress);
          setIsLoading(false);
          return;
        }
      }
      
      // Si no hay caché o se fuerza actualización, obtener datos de Supabase
      console.log(`Obteniendo progreso del usuario ${user.id} desde Supabase`);
      const { data, error } = await supabase
        .rpc('get_user_progress', { p_user_id: user.id });
      
      if (error) {
        console.error('Error obteniendo el progreso del usuario:', error);
        setError(new Error(error.message));
        
        // Intentamos usar la caché como fallback si existe
        const cachedProgress = loadFromCache();
        if (cachedProgress) {
          console.log('Usando caché como fallback debido a error');
          setUserProgress(cachedProgress);
        }
      } else if (data) {
        console.log('Progreso del usuario recibido correctamente:', data);
        // Necesitamos convertir el tipo de datos
        const progress = data as unknown as UserProgress;
        setUserProgress(progress);
        saveToCache(progress);
      }
    } catch (err) {
      console.error('Error en fetchUserProgress:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al obtener el progreso'));
      
      // Intentamos usar la caché como fallback si existe
      const cachedProgress = loadFromCache();
      if (cachedProgress) {
        console.log('Usando caché como fallback debido a error');
        setUserProgress(cachedProgress);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, loadFromCache, saveToCache]);

  // Cargar el progreso cuando cambia el usuario
  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

  // Función para actualizar el progreso manualmente
  const refreshProgress = useCallback(async () => {
    try {
      await fetchUserProgress(true);
      toast({
        title: "Progreso actualizado",
        description: "Se ha actualizado tu información de progreso correctamente.",
      });
      return true;
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la información de progreso."
      });
      return false;
    }
  }, [fetchUserProgress]);

  return {
    userProgress,
    isLoading,
    error,
    refreshProgress
  };
};
