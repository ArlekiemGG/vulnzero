
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
  total?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface BadgeCardProps {
  badge: AchievementBadge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const rarityClasses = {
    common: 'bg-gray-800 text-gray-300 border-gray-500',
    uncommon: 'bg-green-900 text-green-400 border-green-500',
    rare: 'bg-blue-900 text-blue-400 border-blue-500',
    epic: 'bg-purple-900 text-purple-400 border-purple-500',
    legendary: 'bg-amber-900 text-amber-400 border-amber-500',
  };

  return (
    <Card className={`border ${badge.earned ? rarityClasses[badge.rarity] : 'border-gray-700 bg-gray-900 opacity-60'} hover:opacity-100 transition-opacity`}>
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className={`p-3 rounded-full mb-3 ${badge.earned ? 'bg-cybersec-black animate-pulse-neon' : 'bg-gray-800'}`}>
          {badge.icon}
        </div>
        
        <h3 className="font-semibold mb-1">{badge.name}</h3>
        
        <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
        
        {badge.progress !== undefined && badge.total !== undefined && (
          <div className="text-xs text-gray-400 mt-1">
            Progreso: {badge.progress}/{badge.total}
          </div>
        )}
        
        <Badge 
          className={`mt-2 ${badge.earned ? rarityClasses[badge.rarity] : 'bg-gray-800 text-gray-400 border-gray-600'}`}
          variant="outline"
        >
          {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default BadgeCard;
