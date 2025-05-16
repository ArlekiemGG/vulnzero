
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Shield, Award, Terminal, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  progress: number;
  total: number;
  earnedAt?: string;
}

interface AchievementSystemProps {
  userId?: string;
}

export function AchievementSystem({ userId }: AchievementSystemProps) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const effectiveUserId = userId || user?.id;
  
  useEffect(() => {
    if (!effectiveUserId) {
      setLoading(false);
      return;
    }
    
    fetchAchievements(effectiveUserId);
  }, [effectiveUserId]);
  
  const fetchAchievements = async (uid: string) => {
    try {
      setLoading(true);
      
      // Get badges from database
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*');
        
      if (badgesError) throw badgesError;
      
      // Get user badge progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_badge_progress')
        .select('*')
        .eq('user_id', uid);
        
      if (progressError) throw progressError;
      
      // Map database data to achievement objects
      const mappedAchievements = badgesData?.map(badge => {
        const userProgress = progressData?.find(p => p.badge_id === badge.id);
        
        // Determine icon based on badge icon_name
        const iconMap: Record<string, JSX.Element> = {
          'trophy': <Trophy className="h-6 w-6" />,
          'star': <Star className="h-6 w-6" />,
          'shield': <Shield className="h-6 w-6" />,
          'award': <Award className="h-6 w-6" />,
          'terminal': <Terminal className="h-6 w-6" />,
          'database': <Database className="h-6 w-6" />
        };
        
        return {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: iconMap[badge.icon_name] || <Award className="h-6 w-6" />,
          rarity: badge.rarity,
          earned: userProgress?.earned || false,
          progress: userProgress?.current_progress || 0,
          total: badge.required_count || 1,
          earnedAt: userProgress?.earned_at
        } as Achievement;
      }) || [];
      
      setAchievements(mappedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los logros',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando logros...</div>;
  }

  if (!effectiveUserId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-6 w-6" /> Logros y Reconocimientos
          </CardTitle>
          <CardDescription>
            Inicia sesión para ver y desbloquear logros
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-6 w-6" /> Logros y Reconocimientos
        </CardTitle>
        <CardDescription>
          {achievements.filter(a => a.earned).length} de {achievements.length} logros desbloqueados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`border rounded-lg p-4 ${
                  achievement.earned ? 'bg-muted/30' : 'bg-background opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`${getRarityColor(achievement.rarity)} ${
                      achievement.earned ? '' : 'opacity-40'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  <div className={`text-xs uppercase font-semibold px-2 py-1 rounded ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>Progreso</span>
                    <span>{achievement.progress}/{achievement.total}</span>
                  </div>
                  <Progress value={(achievement.progress / achievement.total) * 100} />
                </div>
                
                {achievement.earned && achievement.earnedAt && (
                  <div className="mt-2 text-xs text-right text-muted-foreground">
                    Desbloqueado el {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Award className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p>No hay logros disponibles todavía</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
