
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/client';

// Define the activity type structure
export interface UserActivity {
  id: string;
  type: 'machine_completed' | 'badge_earned' | 'challenge_completed' | 'level_up';
  title: string;
  date: string;
  points: number;
  user_id: string;
}

/**
 * Service for user activity related operations
 */
export const ActivityService = {
  /**
   * Gets recent activity for the current user
   */
  getRecentActivity: async (userId: string, limit = 5): Promise<UserActivity[]> => {
    try {
      // In a real implementation, this would fetch data from a table
      // Since there's no activity table yet, we'll return mock data for now
      // but structured for easy replacement with real data later
      
      // This should be replaced with real database queries when an activity
      // table is created in Supabase
      return [
        {
          id: "activity1",
          user_id: userId,
          type: "machine_completed",
          title: "WebIntrusion",
          date: "Hoy, 14:25",
          points: 25
        },
        {
          id: "activity2",
          user_id: userId,
          type: "badge_earned",
          title: "Explorador de Redes",
          date: "Ayer, 18:40",
          points: 50
        },
        {
          id: "activity3",
          user_id: userId,
          type: "challenge_completed",
          title: "Desafío: Semana Forense",
          date: "15 May, 09:12",
          points: 100
        },
        {
          id: "activity4",
          user_id: userId,
          type: "level_up",
          title: "Nivel 7",
          date: "12 May, 22:30",
          points: 0
        }
      ];
      
      // When a real activity table is created, the query would look like this:
      /*
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data || [];
      */
    } catch (error) {
      console.error('Error al obtener la actividad reciente:', error);
      return [];
    }
  }
};
