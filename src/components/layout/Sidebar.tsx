
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Database, Book, Calendar, 
  Code, Flag, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChallengeService } from '@/components/challenges/ChallengeService';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  userStats: {
    level: number;
    points: number;
    pointsToNextLevel: number;
    progress: number;
    rank: number;
    solvedMachines: number;
    completedChallenges: number;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ userStats }) => {
  const { user } = useAuth();
  const [weeklyChallenge, setWeeklyChallenge] = useState<{
    title: string;
    progress: number;
    total: number;
  } | null>(null);
  
  useEffect(() => {
    const loadWeeklyChallenge = async () => {
      if (!user) return;
      
      try {
        const activeChallenge = await ChallengeService.getActiveWeeklyChallenge(user.id);
        
        if (activeChallenge) {
          setWeeklyChallenge({
            title: activeChallenge.title,
            progress: activeChallenge.progress,
            total: activeChallenge.total
          });
        }
      } catch (error) {
        console.error("Error loading weekly challenge:", error);
      }
    };
    
    loadWeeklyChallenge();
  }, [user]);
  
  const menuItems = [
    { icon: <Trophy className="h-4 w-4" />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <Database className="h-4 w-4" />, label: 'Máquinas', path: '/machines' },
    { icon: <Calendar className="h-4 w-4" />, label: 'Desafíos', path: '/challenges' },
    { icon: <Code className="h-4 w-4" />, label: 'Laboratorios', path: '/labs' },
    { icon: <Flag className="h-4 w-4" />, label: 'CTFs', path: '/ctfs' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 pt-16 bg-cybersec-black border-r border-cybersec-darkgray">
      <div className="px-4 py-6">
        <div className="neon-border p-4 rounded-lg bg-cybersec-darkgray mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Nivel {userStats.level}</span>
            <Badge variant="outline" className="border-cybersec-electricblue text-cybersec-electricblue">
              Rank #{userStats.rank || '-'}
            </Badge>
          </div>
          <Progress value={userStats.progress} className="h-2 bg-cybersec-darkgray" />
          <div className="flex justify-between text-xs mt-2">
            <span>{userStats.points} pts</span>
            <span>{userStats.pointsToNextLevel} pts para nivel {userStats.level + 1}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wider mb-3 text-cybersec-electricblue">Estadísticas</h3>
          <div className="flex justify-between py-2">
            <span className="text-sm">Máquinas resueltas</span>
            <Badge variant="secondary" className="bg-cybersec-darkgray text-cybersec-neongreen">
              {userStats.solvedMachines}
            </Badge>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm">Desafíos completados</span>
            <Badge variant="secondary" className="bg-cybersec-darkgray text-cybersec-neongreen">
              {userStats.completedChallenges}
            </Badge>
          </div>
        </div>
        
        <Separator className="my-4 bg-cybersec-darkgray" />
        
        <nav className="space-y-1">
          <h3 className="text-xs uppercase tracking-wider mb-3 text-cybersec-electricblue">Navegación</h3>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start text-cybersec-neongreen hover:bg-cybersec-darkgray hover:text-cybersec-neongreen"
              asChild
            >
              <Link to={item.path} className="flex items-center">
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <div className="mt-8">
          <div className="neon-border-blue p-3 rounded-lg bg-cybersec-darkgray">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-cybersec-electricblue" />
              <h3 className="text-cybersec-electricblue">Desafío Semanal</h3>
            </div>
            {weeklyChallenge ? (
              <>
                <p className="text-sm mt-2">{weeklyChallenge.title}</p>
                <Progress 
                  value={(weeklyChallenge.progress / weeklyChallenge.total) * 100} 
                  className="h-2 mt-3 bg-cybersec-darkgray" 
                />
                <div className="text-xs text-right mt-1">
                  {weeklyChallenge.progress}/{weeklyChallenge.total} completadas
                </div>
              </>
            ) : (
              <>
                <p className="text-sm mt-2">¡Resuelve 3 máquinas esta semana para ganar 500 puntos extra!</p>
                <Progress value={0} className="h-2 mt-3 bg-cybersec-darkgray" />
                <div className="text-xs text-right mt-1">0/3 completadas</div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
