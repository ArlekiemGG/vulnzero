
import React from 'react';
import { LeaderboardEntry } from './types';
import CTFLeaderboardCard from './CTFLeaderboardCard';
import CTFGuideCard from './CTFGuideCard';

interface CTFInfoCardsProps {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
}

const CTFInfoCards: React.FC<CTFInfoCardsProps> = ({ leaderboard, loading }) => {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <CTFLeaderboardCard leaderboard={leaderboard} loading={loading} />
      <CTFGuideCard />
    </div>
  );
};

export default CTFInfoCards;
