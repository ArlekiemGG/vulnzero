
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
        
        // Fetch solved machines count
        const { count: solvedMachines, error: machinesError } = await supabase
          .from('user_machine_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('completed', true);
          
        if (machinesError) throw machinesError;
        
        // Fetch completed challenges count
        const { count: completedChallenges, error: challengesError } = await supabase
          .from('challenges_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('completed', true);
          
        if (challengesError) throw challengesError;
        
        // Fetch user rank (assuming there's a function for this)
        const { data: rankData, error: rankError } = await supabase
          .rpc('get_user_ranking', { user_id: userId });
          
        if (rankError) throw rankError;
        
        const points = profileData?.points || 0;
        const level = profileData?.level || 1;
        const pointsToNextLevel = level * 1000;
        const progress = (points % pointsToNextLevel) / pointsToNextLevel * 100;
        
        setUserStats({
          level,
          points,
          pointsToNextLevel,
          progress,
          rank: rankData || 0,
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
