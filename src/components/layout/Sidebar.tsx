import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Database, Book, Calendar, 
  Flag, Activity, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ChallengeService } from '@/components/challenges/ChallengeService';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressSummary } from './ProgressSummary';
import { useUser } from '@/contexts/UserContext';

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
  const { detailedProgress } = useUser();
  const [weeklyChallenge, setWeeklyChallenge] = React.useState<{
    title: string;
    progress: number;
    total: number;
  } | null>(null);
  
  React.useEffect(() => {
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
    { icon: <GraduationCap className="h-4 w-4" />, label: 'Cursos', path: '/courses' },
    { icon: <Calendar className="h-4 w-4" />, label: 'Desafíos', path: '/challenges' },
    { icon: <Flag className="h-4 w-4" />, label: 'CTFs', path: '/ctfs' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 pt-16 bg-cybersec-black border-r border-cybersec-darkgray">
      <div className="px-4 py-6">
        {/* Reemplazamos el bloque anterior con nuestro nuevo componente */}
        <ProgressSummary />
        
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

        {detailedProgress && detailedProgress.detailed_progress.machine_progress.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-wider mb-3 text-cybersec-electricblue">
              Máquinas Recientes
            </h3>
            <div className="space-y-2">
              {detailedProgress.detailed_progress.machine_progress.slice(0, 3).map((machine, idx) => (
                <div key={idx} className="text-sm flex justify-between items-center">
                  <div className="truncate max-w-[70%]">{machine.machine_id}</div>
                  <Badge variant={machine.completed ? "success" : "default"}>
                    {machine.completed ? "Completada" : `${machine.progress}%`}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

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
