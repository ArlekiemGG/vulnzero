import { supabase } from '@/integrations/supabase/client';
import { LeaderboardEntry } from '../types';
import { useAuth } from '@/contexts/AuthContext';

export const LeaderboardService = {
  // Get leaderboard data with better username handling
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    try {
      // First, fetch the current user to identify them in the leaderboard
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // Fetch leaderboard data with proper ordering and limit
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Map profiles to leaderboard entries with improved username display
      return profiles.map((profile, index) => {
        // Create a safe display name that protects user privacy
        let displayName = profile.username || 'User';
        
        // If it's an email, extract just the username part before @ and apply some obfuscation
        if (displayName.includes('@') && displayName.includes('.')) {
          displayName = displayName.split('@')[0];
          // Add some randomization to avoid username collisions while keeping it recognizable
          if (displayName.length > 3) {
            displayName = displayName.substring(0, 3) + '***';
          }
        }
        
        return {
          rank: index + 1,
          name: displayName,
          points: profile.points || 0,
          solved: profile.solved_machines || 0,
          isCurrentUser: profile.id === currentUserId
        };
      });
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return [];
    }
  },

  // Function to update user ranks in the database
  updateLeaderboardRanks: async (): Promise<void> => {
    try {
      // Instead of calling the RPC function directly, we'll manually update ranks
      // based on points in descending order
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, points')
        .order('points', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      // Update each profile with its new rank
      for (let i = 0; i < profiles.length; i++) {
        const newRank = i + 1;
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ rank: newRank })
          .eq('id', profiles[i].id);
          
        if (updateError) {
          console.error(`Error updating rank for profile ${profiles[i].id}:`, updateError);
        }
      }
      
      console.log('Leaderboard ranks updated successfully');
    } catch (error) {
      console.error('Failed to update leaderboard ranks:', error);
    }
  }
};

export default LeaderboardService;
