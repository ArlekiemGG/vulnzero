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
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // Transform the data to match our interface
      return data.map(activity => ({
        id: activity.id,
        user_id: activity.user_id,
        type: activity.type as 'machine_completed' | 'badge_earned' | 'challenge_completed' | 'level_up',
        title: activity.title,
        date: formatDate(activity.created_at),
        points: activity.points
      }));
    } catch (error) {
      console.error('Error al obtener la actividad reciente:', error);
      return [];
    }
  },

  /**
   * Logs a new user activity
   */
  logActivity: async (
    userId: string, 
    type: 'machine_completed' | 'badge_earned' | 'challenge_completed' | 'level_up',
    title: string,
    points: number = 0
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc(
        'log_user_activity',
        {
          p_user_id: userId,
          p_type: type,
          p_title: title,
          p_points: points
        }
      );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al registrar actividad:', error);
      return false;
    }
  }
};

// Helper function to format dates in a user-friendly way
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // If it's today
  if (date.toDateString() === now.toDateString()) {
    return `Hoy, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // If it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return `Ayer, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Otherwise return the date
  const day = date.getDate().toString().padStart(2, '0');
  const month = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][date.getMonth()];
  return `${day} ${month}, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};
