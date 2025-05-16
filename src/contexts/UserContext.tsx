
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  useUserProgress, 
  UserStats as ProgressUserStats, 
  UserProgress 
} from '@/hooks/use-user-progress';

// Mantenemos la interfaz UserStats original para compatibilidad
export interface UserStats {
  level: number;
  points: number;
  pointsToNextLevel: number;
  progress: number;
  rank: number;
  solvedMachines: number;
  completedChallenges: number;
}

interface UserContextType {
  user: any; // Add the user property from AuthContext
  userStats: UserStats;
  loading: boolean;
  refreshUserStats: () => Promise<void>;
  detailedProgress: UserProgress | null;
}

const defaultUserStats: UserStats = {
  level: 1,
  points: 0,
  pointsToNextLevel: 100,
  progress: 0,
  rank: 0,
  solvedMachines: 0,
  completedChallenges: 0,
};

const UserContext = createContext<UserContextType>({
  user: null, // Initialize with null
  userStats: defaultUserStats,
  loading: true,
  refreshUserStats: async () => {},
  detailedProgress: null,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>(defaultUserStats);
  const { userProgress, isLoading, refreshProgress } = useUserProgress();
  
  // Actualizar las estadísticas del usuario cuando cambia el progreso
  useEffect(() => {
    if (userProgress) {
      const stats = userProgress.user_stats;
      
      // Calcular progreso al siguiente nivel (fórmula simple: 500 puntos por nivel)
      const pointsPerLevel = 500;
      const currentLevelPoints = (stats.level - 1) * pointsPerLevel;
      const nextLevelPoints = stats.level * pointsPerLevel;
      const pointsInCurrentLevel = stats.points - currentLevelPoints;
      const progressToNextLevel = Math.min(100, Math.round((pointsInCurrentLevel / pointsPerLevel) * 100));
      
      setUserStats({
        level: stats.level || 1,
        points: stats.points || 0,
        pointsToNextLevel: nextLevelPoints - stats.points,
        progress: progressToNextLevel,
        rank: stats.rank || 0,
        solvedMachines: stats.solved_machines || 0,
        completedChallenges: stats.completed_courses || 0,
      });
      
      console.log('Estadísticas de usuario actualizadas desde el progreso unificado');
    }
  }, [userProgress]);
  
  // Suscribirse a cambios en las tablas relevantes
  useEffect(() => {
    if (!user) return;
    
    // Suscribirse a actualizaciones del perfil
    const profileSubscription = supabase
      .channel('schema-db-changes-profile')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          console.log('Perfil actualizado, refrescando progreso');
          refreshProgress();
        }
      )
      .subscribe();
    
    // Suscribirse a nuevas actividades
    const activitySubscription = supabase
      .channel('schema-db-changes-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Nueva actividad detectada, refrescando progreso');
          refreshProgress();
        }
      )
      .subscribe();
    
    // Suscribirse a progreso en cursos
    const courseProgressSubscription = supabase
      .channel('schema-db-changes-course-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_course_progress',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Progreso de curso actualizado, refrescando progreso');
          refreshProgress();
        }
      )
      .subscribe();
      
    // Suscribirse a progreso en lecciones
    const lessonProgressSubscription = supabase
      .channel('schema-db-changes-lesson-progress')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_lesson_progress',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Nueva lección completada, refrescando progreso');
          refreshProgress();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(profileSubscription);
      supabase.removeChannel(activitySubscription);
      supabase.removeChannel(courseProgressSubscription);
      supabase.removeChannel(lessonProgressSubscription);
    };
  }, [user, refreshProgress]);

  // Función para actualizar estadísticas manualmente
  const refreshUserStats = async () => {
    console.log('Actualización manual del progreso del usuario solicitada');
    await refreshProgress();
  };

  return (
    <UserContext.Provider value={{ 
      user, // Pass the user from AuthContext
      userStats, 
      loading: isLoading, 
      refreshUserStats, 
      detailedProgress: userProgress 
    }}>
      {children}
    </UserContext.Provider>
  );
};
