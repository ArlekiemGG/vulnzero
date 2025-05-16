
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserStats = {
  level: number;
  points: number;
  pointsToNextLevel: number;
  progress: number;
  rank: number;
  solvedMachines: number;
  completedChallenges: number;
};

const defaultStats: UserStats = {
  level: 1,
  points: 0,
  pointsToNextLevel: 1000,
  progress: 0,
  rank: 0,
  solvedMachines: 0,
  completedChallenges: 0,
};

export const useUserStats = (userId?: string) => {
  const [userStats, setUserStats] = useState<UserStats>(defaultStats);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user points and level
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('points, level')
          .eq('id', userId)
          .single();
          
        if (profileError) throw profileError;
        
        // Fix: Use count() option instead of count: 'exact' to avoid type issues
        const { count: solvedMachines, error: machinesError } = await supabase
          .from('user_machine_progress')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .eq('completed_at', 'is', 'not.null')
          .limit(0);
          
        if (machinesError) throw machinesError;
        
        // Fix: Use same approach for completed challenges
        const { count: completedChallenges, error: challengesError } = await supabase
          .from('user_activities')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .eq('type', 'challenge')
          .eq('title', 'completed')
          .limit(0);
          
        if (challengesError) throw challengesError;
        
        // Calculate user rank based on points
        let rank = 0;
        try {
          const { data: usersWithHigherPoints, error: rankError } = await supabase
            .from('profiles')
            .select('id')
            .gt('points', profileData?.points || 0);
            
          if (rankError) throw rankError;
          
          // Rank is number of users with higher points + 1
          rank = (usersWithHigherPoints?.length || 0) + 1;
        } catch (rankErr) {
          console.error('Error calculating rank:', rankErr);
          // Continue with default rank
        }
        
        const points = profileData?.points || 0;
        const level = profileData?.level || 1;
        const pointsToNextLevel = level * 1000;
        const progress = (points % pointsToNextLevel) / pointsToNextLevel * 100;
        
        setUserStats({
          level,
          points,
          pointsToNextLevel,
          progress,
          rank,
          solvedMachines: solvedMachines || 0,
          completedChallenges: completedChallenges || 0,
        });
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [userId]);

  return { userStats, loading, error };
};
