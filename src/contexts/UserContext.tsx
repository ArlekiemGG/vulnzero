
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase, queries } from '@/integrations/supabase/client';

export interface UserStats {
  level: number;
  points: number;
  pointsToNextLevel: number;
  progress: number;
  rank: number;
  solvedMachines: number;
  completedChallenges: number;
}

interface UserContextType {
  userStats: UserStats;
  loading: boolean;
  refreshUserStats: () => Promise<void>;
}

const defaultUserStats: UserStats = {
  level: 1,
  points: 0,
  pointsToNextLevel: 100,
  progress: 0,
  rank: 0,
  solvedMachines: 0,
  completedChallenges: 0,
};

const UserContext = createContext<UserContextType>({
  userStats: defaultUserStats,
  loading: true,
  refreshUserStats: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>(defaultUserStats);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserProfile = async () => {
    if (!user) {
      setLoading(false);
      setUserStats(defaultUserStats);
      return;
    }

    try {
      console.log('Fetching user profile for:', user.id);
      setLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (profile) {
        console.log('User profile loaded:', profile);
        // Calculate progress to next level (simple formula: need 500 points per level)
        const pointsPerLevel = 500;
        const currentLevelPoints = (profile.level - 1) * pointsPerLevel;
        const nextLevelPoints = profile.level * pointsPerLevel;
        const pointsInCurrentLevel = profile.points - currentLevelPoints;
        const progressToNextLevel = Math.min(100, Math.round((pointsInCurrentLevel / pointsPerLevel) * 100));
        
        setUserStats({
          level: profile.level || 1,
          points: profile.points || 0,
          pointsToNextLevel: nextLevelPoints - profile.points,
          progress: progressToNextLevel,
          rank: profile.rank || 0,
          solvedMachines: profile.solved_machines || 0,
          completedChallenges: profile.completed_challenges || 0,
        });
        console.log('User stats updated');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    
    // Subscribe to profile changes and activity changes
    if (user) {
      // Subscribe to profile updates
      const profileSubscription = supabase
        .channel('schema-db-changes-profile')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            console.log('Profile updated:', payload);
            fetchUserProfile();
          }
        )
        .subscribe();
      
      // Subscribe to new activities (for CTF registrations, etc.)
      const activitySubscription = supabase
        .channel('schema-db-changes-activities')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_activities',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New activity detected:', payload);
            fetchUserProfile();
          }
        )
        .subscribe();
      
      // Subscribe to CTF registrations
      const registrationSubscription = supabase
        .channel('schema-db-changes-registrations')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ctf_registrations',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New CTF registration detected:', payload);
            fetchUserProfile();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(profileSubscription);
        supabase.removeChannel(activitySubscription);
        supabase.removeChannel(registrationSubscription);
      };
    }
  }, [user]);

  const refreshUserStats = async () => {
    console.log('Manually refreshing user stats');
    await fetchUserProfile();
  };

  return (
    <UserContext.Provider value={{ userStats, loading, refreshUserStats }}>
      {children}
    </UserContext.Provider>
  );
};
