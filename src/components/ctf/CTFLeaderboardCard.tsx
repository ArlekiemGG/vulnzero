
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaderboardEntry } from './types';
import { Skeleton } from '@/components/ui/skeleton';

interface CTFLeaderboardCardProps {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
}

const CTFLeaderboardCard: React.FC<CTFLeaderboardCardProps> = ({ leaderboard, loading }) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-cybersec-yellow" />
          <CardTitle className="text-cybersec-yellow">Clasificación Global</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {leaderboard.map((player) => (
              <div 
                key={player.rank}
                className={cn(
                  "flex items-center justify-between p-2 rounded",
                  player.isCurrentUser ? "bg-cybersec-yellow/10 border border-cybersec-yellow" : "hover:bg-cybersec-black"
                )}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center mr-3",
                    player.rank === 1 ? "bg-cybersec-yellow text-cybersec-black" : 
                    player.rank === 2 ? "bg-gray-400 text-cybersec-black" : 
                    player.rank === 3 ? "bg-cybersec-red text-cybersec-black" : 
                    "bg-cybersec-black text-gray-300"
                  )}>
                    {player.rank}
                  </div>
                  <span className={player.isCurrentUser ? "font-bold text-cybersec-yellow" : ""}>{player.name}</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 text-sm text-gray-400">
                    <span className="mr-1">{player.solved}</span>
                    resueltos
                  </div>
                  <div className="font-mono font-semibold">
                    {player.points} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full border-cybersec-yellow text-cybersec-yellow"
          onClick={() => navigate('/leaderboard')}
        >
          Ver clasificación completa
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CTFLeaderboardCard;
