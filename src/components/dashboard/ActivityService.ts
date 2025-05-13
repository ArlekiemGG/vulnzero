
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/client';

// Define the activity type structure
export interface UserActivity {
  id: string;
  type: 'machine_completed' | 'badge_earned' | 'challenge_completed' | 'level_up' | 'course_enrolled';
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
   * Only retrieves activities related to completed gamified tasks
   */
  getRecentActivity: async (userId: string, limit = 5): Promise<UserActivity[]> => {
    try {
      console.log('Getting recent activities for user:', userId);
      
      // Get real user activities:
      // 1. Only select activities with positive points
      // 2. Only select activities with specific types
      // 3. Filter out any test data
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        // Only get activities with points (real gamified tasks)
        .gt('points', 0)
        // Only get activities for completed tasks
        .in('type', ['machine_completed', 'badge_earned', 'challenge_completed', 'level_up', 'course_enrolled'])
        // Filter out any test/demo data
        .not('title', 'ilike', '%Test%')
        .not('title', 'ilike', '%WebIntrusion%')
        .not('title', 'ilike', '%Explorador de Redes%')
        .not('title', 'ilike', '%Desafío: Semana Forense%')
        .not('title', 'eq', 'Nivel 7')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }
      
      console.log('Activities fetched:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.log('No activities found');
        return [];
      }
      
      // Get unique activities to avoid any duplicates
      const uniqueActivities = Array.from(
        new Map(data.map(item => [item.id, item])).values()
      );
      
      console.log('Unique activities:', uniqueActivities.length);
      
      // Transform the data to match our interface
      return uniqueActivities.map(activity => ({
        id: activity.id,
        user_id: activity.user_id,
        type: activity.type as 'machine_completed' | 'badge_earned' | 'challenge_completed' | 'level_up' | 'course_enrolled',
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
    type: 'machine_completed' | 'badge_earned' | 'challenge_completed' | 'level_up' | 'course_enrolled',
    title: string,
    points: number = 0
  ): Promise<boolean> => {
    try {
      // Check if this activity already exists to prevent duplicates
      const { data: existingActivity } = await supabase
        .from('user_activities')
        .select('id')
        .eq('user_id', userId)
        .eq('type', type)
        .eq('title', title)
        .limit(1);
      
      // If activity already exists, don't log it again
      if (existingActivity && existingActivity.length > 0) {
        console.log('Activity already exists, skipping:', type, title);
        return true;
      }
      
      // Log the new activity
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
