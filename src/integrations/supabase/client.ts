
// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://locviruzkdfnhusfquuc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3ZpcnV6a2Rmbmh1c2ZxdXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODM1MTQsImV4cCI6MjA2MjY1OTUxNH0.VJW1juYE_poSS-FTBqoZxA5xSH9WY6vsW3upb-GvJ80";

// Export type definitions for easier use in components
export type Tables = Database['public']['Tables'];
export type Profiles = Tables['profiles']['Row'];

// Client configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});

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
          const username = userData.user.user_metadata?.username || 
                        userData.user.email?.split('@')[0] || 
                        'User';
          
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
  }
};
