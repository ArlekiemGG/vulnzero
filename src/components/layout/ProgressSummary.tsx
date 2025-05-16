
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';

export const ProgressSummary = () => {
  const { userStats, loading, refreshUserStats, detailedProgress } = useUser();
  
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  
  return (
    <div className="neon-border p-4 rounded-lg bg-cybersec-darkgray mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Nivel {userStats.level}</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cybersec-electricblue text-cybersec-electricblue">
            Rank #{userStats.rank || '-'}
          </Badge>
          <button 
            onClick={() => refreshUserStats()} 
            className="text-cybersec-electricblue hover:text-white transition-colors"
            title="Actualizar progreso"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
      <Progress value={userStats.progress} className="h-2 bg-cybersec-darkgray" />
      <div className="flex justify-between text-xs mt-2">
        <span>{userStats.points} pts</span>
        <span>{userStats.pointsToNextLevel} pts para nivel {userStats.level + 1}</span>
      </div>
      
      {detailedProgress && (
        <div className="mt-4 pt-3 border-t border-cybersec-darkgray text-xs text-gray-400">
          <div className="flex justify-between mb-1">
            <span>Cursos completados:</span>
            <span className="text-cybersec-neongreen">{detailedProgress.user_stats.completed_courses}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Lecciones completadas:</span>
            <span className="text-cybersec-neongreen">{detailedProgress.user_stats.completed_lessons}</span>
          </div>
          <div className="flex justify-between">
            <span>Insignias ganadas:</span>
            <span className="text-cybersec-neongreen">{detailedProgress.user_stats.earned_badges}</span>
          </div>
        </div>
      )}
    </div>
  );
};
