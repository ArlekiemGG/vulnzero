
import { supabase } from '@/integrations/supabase/client';
import { LeaderboardEntry } from '../types';

export const LeaderboardService = {
  // Get leaderboard data
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Map profiles to leaderboard entries
      return profiles.map((profile, index) => {
        // Create a display username that doesn't expose email addresses
        let displayName = profile.username || `Usuario`;
        
        // If it's an email, extract just the username part before @
        if (displayName.includes('@') && displayName.includes('.')) {
          displayName = displayName.split('@')[0];
        }
        
        return {
          rank: index + 1,
          name: displayName,
          points: profile.points || 0,
          solved: profile.solved_machines || 0,
          isCurrentUser: false // Will be set later for current user
        };
      });
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return [];
    }
  }
};

export default LeaderboardService;
