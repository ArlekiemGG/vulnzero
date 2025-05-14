
// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://locviruzkdfnhusfquuc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3ZpcnV6a2Rmbmh1c2ZxdXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODM1MTQsImV4cCI6MjA2MjY1OTUxNH0.VJW1juYE_poSS-FTBqoZxA5xSH9WY6vsW3upb-GvJ80";

// Export type definitions for easier use in components
export type Tables = Database['public']['Tables'];
export type Profiles = Tables['profiles']['Row'];
export type UserActivity = Tables['user_activities']['Row'];

// Client configuration with explicit auth settings
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: localStorage,
    flowType: 'pkce',
  }
});

// Declare global timer for auth refresh
declare global {
  interface Window {
    refreshTimer?: number;
  }
}

// User profile operations
export const queries = {
  getUserProfile: async (userId: string) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // If no profile exists, create a default one
      if (!data) {
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          // Generate a better username that's not an email address
          let username = '';
          
          if (userData.user.user_metadata?.username) {
            username = userData.user.user_metadata.username;
          } else if (userData.user.email) {
            // Get the part before @ in email
            username = userData.user.email.split('@')[0];
            
            // Add a random number to make it more unique
            username = `${username}${Math.floor(Math.random() * 1000)}`;
          } else {
            username = `Usuario${Math.floor(Math.random() * 10000)}`;
          }
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              username,
              points: 0,
              level: 1,
              solved_machines: 0,
              completed_challenges: 0
            })
            .select()
            .single();
          
          if (createError) throw createError;
          
          return newProfile;
        }
      }
      
      return data;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  },
  
  getLeaderboard: async (limit = 100, offset = 0) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error in getLeaderboard:", error);
      return [];
    }
  },
  
  // Function to log user activity - ensuring we don't create test data
  logUserActivity: async (userId: string, activityType: string, title: string, points: number = 0) => {
    try {
      // Skip any test activities to avoid polluting user data
      if (
        title.toLowerCase().includes('test') || 
        title === 'WebIntrusion' ||
        title === 'Explorador de Redes' ||
        title === 'Desafío: Semana Forense' ||
        title === 'Nivel 7'
      ) {
        console.log('Skipping test activity:', title);
        return { success: true, id: null };
      }
      
      // Check for duplicates before inserting
      const { data: existingActivity } = await supabase
        .from('user_activities')
        .select('id')
        .eq('user_id', userId)
        .eq('type', activityType)
        .eq('title', title)
        .limit(1);
      
      if (existingActivity && existingActivity.length > 0) {
        console.log('Activity already exists, skipping:', activityType, title);
        return { success: true, id: existingActivity[0].id };
      }
      
      const { data, error } = await supabase.rpc(
        'log_user_activity',
        {
          p_user_id: userId,
          p_type: activityType,
          p_title: title,
          p_points: points
        }
      );

      if (error) throw error;
      return { success: true, id: data };
    } catch (error) {
      console.error("Error logging user activity:", error);
      return { success: false, id: null };
    }
  }
};
