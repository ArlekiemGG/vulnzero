
import { supabase } from '@/integrations/supabase/client';

/**
 * Seeds initial activity data for a user for testing purposes.
 * Call this function when you want to add test activities for a user.
 */
export const seedUserActivities = async (userId: string) => {
  if (!userId) return;
  
  try {
    // Check if user already has activities
    const { count, error } = await supabase
      .from('user_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Only seed if user has no activities
    if (count && count > 0) {
      console.log('User already has activities, skipping seeding');
      return;
    }
    
    console.log('Seeding initial user activities...');
    
    // Sample activities to seed
    const activities = [
      {
        user_id: userId,
        type: 'machine_completed',
        title: 'WebIntrusion',
        points: 25
      },
      {
        user_id: userId,
        type: 'badge_earned',
        title: 'Explorador de Redes',
        points: 50
      },
      {
        user_id: userId,
        type: 'challenge_completed',
        title: 'Desafío: Semana Forense',
        points: 100
      },
      {
        user_id: userId,
        type: 'level_up',
        title: 'Nivel 7',
        points: 0
      }
    ];
    
    // Insert each activity with a delay to create a more realistic timeline
    for (const activity of activities) {
      const { error } = await supabase
        .from('user_activities')
        .insert([activity]);
        
      if (error) throw error;
      
      // Wait a second between inserts to create time difference
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Successfully seeded user activities');
    
  } catch (error) {
    console.error('Error seeding user activities:', error);
  }
};
