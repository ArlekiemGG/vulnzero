
import { supabase } from '@/integrations/supabase/client';
import { BadgeIcon, getBadgeIcon } from './BadgeIcons';
import { AchievementBadge } from './BadgeCard';

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  required_count?: number;
}

export interface UserBadgeProgress {
  badge_id: string;
  user_id: string;
  current_progress: number;
  earned: boolean;
  earned_at?: string;
}

export const BadgeService = {
  /**
   * Get all badges with user progress
   */
  getUserBadges: async (userId: string): Promise<AchievementBadge[]> => {
    try {
      // First, get all available badges
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*');

      if (badgesError) {
        console.error('Error fetching badges:', badgesError);
        return [];
      }

      // If no badges exist in the database, return default ones for display
      if (!badges || badges.length === 0) {
        return getDefaultBadges();
      }

      // Next, get user's progress for these badges
      const { data: userProgress, error: progressError } = await supabase
        .from('user_badge_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        console.error('Error fetching user badge progress:', progressError);
        return [];
      }

      // Map badges with user progress
      return badges.map(badge => {
        const progress = userProgress?.find(p => p.badge_id === badge.id);
        const icon = getBadgeIcon(badge.icon_name);
        
        return {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: icon,
          earned: progress?.earned || false,
          progress: progress?.current_progress || 0,
          total: badge.required_count,
          rarity: badge.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
        };
      });
    } catch (error) {
      console.error('Error in getUserBadges:', error);
      return getDefaultBadges();
    }
  }
};

// Default badges to show if no real data exists yet
const getDefaultBadges = (): AchievementBadge[] => {
  return [
    {
      id: "badge1",
      name: "Primer Sangre",
      description: "Completa tu primera máquina vulnerable",
      icon: getBadgeIcon('trophy'),
      earned: false,
      rarity: "common"
    },
    {
      id: "badge2",
      name: "Explorador de Redes",
      description: "Completa 5 máquinas con enfoque en redes",
      icon: getBadgeIcon('database'),
      earned: false,
      progress: 0,
      total: 5,
      rarity: "uncommon"
    },
    {
      id: "badge3",
      name: "Maestro Web",
      description: "Resolver 10 desafíos de seguridad web",
      icon: getBadgeIcon('code'),
      earned: false,
      progress: 0,
      total: 10,
      rarity: "rare"
    },
    {
      id: "badge4",
      name: "Dominador de CTFs",
      description: "Ganar un CTF semanal",
      icon: getBadgeIcon('flag'),
      earned: false,
      rarity: "legendary"
    }
  ];
};
