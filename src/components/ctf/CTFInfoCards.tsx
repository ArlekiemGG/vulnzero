
import React, { useEffect } from 'react';
import { LeaderboardEntry } from './types';
import CTFLeaderboardCard from './CTFLeaderboardCard';
import CTFGuideCard from './CTFGuideCard';
import { useAuth } from '@/contexts/AuthContext';

interface CTFInfoCardsProps {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
}

const CTFInfoCards: React.FC<CTFInfoCardsProps> = ({ leaderboard, loading }) => {
  const { user } = useAuth();
  
  // Add effect to highlight current user in leaderboard
  useEffect(() => {
    if (user && leaderboard.length > 0) {
      // Find if the current user is in the leaderboard
      const isUserInLeaderboard = leaderboard.some(entry => entry.isCurrentUser);
      
      if (isUserInLeaderboard) {
        console.log('Current user found in leaderboard');
      } else {
        console.log('Current user not in top leaderboard positions');
      }
    }
  }, [user, leaderboard]);

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <CTFLeaderboardCard leaderboard={leaderboard} loading={loading} />
      <CTFGuideCard />
    </div>
  );
};

export default CTFInfoCards;
