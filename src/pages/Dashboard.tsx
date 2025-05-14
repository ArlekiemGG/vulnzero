import React, { useEffect, useState } from 'react';
import { Database, Trophy, Flag, Shield, Code, User, Activity } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import BadgeCard from '@/components/dashboard/BadgeCard';
import { AchievementBadge } from '@/components/dashboard/BadgeCard';
import MachineCard from '@/components/machines/MachineCard';
import { Link } from 'react-router-dom';
import { supabase, queries, Profiles } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ActivityService } from '@/components/dashboard/ActivityService';
import { ChallengeService } from '@/components/challenges/ChallengeService';
import { BadgeService } from '@/components/dashboard/BadgeService';

// Mock data para máquinas recomendadas - now with consistent hasActiveSession property like on machines page
const recommendedMachines = [
  {
    id: "machine1",
    name: "VulnNet",
    description: "Una máquina vulnerable que contiene varias debilidades en su infraestructura web. Ideal para principiantes.",
    difficulty: "easy" as const,
    categories: ["Web", "Privilege Escalation"],
    points: 20,
    solvedBy: 1250,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=320&auto=format&fit=crop",
    osType: "linux" as const,
    featured: true,
    hasActiveSession: false
  },
  {
    id: "machine2",
    name: "CryptoLocker",
    description: "Máquina enfocada en técnicas de criptografía y explotación de servicios mal configurados.",
    difficulty: "medium" as const,
    categories: ["Crypto", "Enumeration"],
    points: 30,
    solvedBy: 842,
    userProgress: 45,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=320&auto=format&fit=crop",
    osType: "linux" as const,
    hasActiveSession: false
  },
  {
    id: "machine3",
    name: "SecureServer 2023",
    description: "Un servidor Windows con múltiples vulnerabilidades. Enfocado en técnicas de post-explotación.",
    difficulty: "hard" as const,
    categories: ["Active Directory", "Windows"],
    points: 40,
    solvedBy: 356,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=320&auto=format&fit=crop",
    osType: "windows" as const,
    hasActiveSession: false
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<Profiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<{
    id: string;
    title: string;
    progress: number;
    total: number;
    points: number;
  } | null>(null);

  // Calcular puntos para siguiente nivel (simple: nivel actual * 500)
  const pointsToNextLevel = userProfile ? userProfile.level * 500 - userProfile.points : 0;
  
  // Calcular progreso como porcentaje
  const levelProgress = userProfile ? Math.min(
    Math.round((userProfile.points / (userProfile.level * 500)) * 100),
    100
  ) : 0;

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const profileData = await queries.getUserProfile(user.id);
          
        if (!profileData) {
          console.error('No profile data returned');
          toast({
            title: "Error al cargar perfil",
            description: "No se pudieron cargar tus datos de perfil.",
            variant: "destructive"
          });
          return;
        }
        
        console.log("Profile data loaded:", profileData);
        setUserProfile(profileData);
        setIsAdmin(profileData.role === 'admin');
        
        // Load user activity from real data only
        const activity = await ActivityService.getRecentActivity(user.id);
        console.log("Loaded activity:", activity);
        setRecentActivity(activity);
        
        // Initialize badges for new users and then load user badges data
        await BadgeService.initializeUserBadges(user.id);
        const userBadges = await BadgeService.getUserBadges(user.id);
        console.log("Loaded badges:", userBadges);
        setBadges(userBadges);
        
        // Load active weekly challenge with real user progress
        const weeklyChallenge = await ChallengeService.getActiveWeeklyChallenge(user.id);
        if (weeklyChallenge) {
          console.log("Loaded weekly challenge:", weeklyChallenge);
          setActiveChallenge(weeklyChallenge);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error al cargar perfil",
          description: "No se pudieron cargar tus datos de perfil.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user, toast]);

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={{
          level: userProfile?.level || 1,
          points: userProfile?.points || 0,
          pointsToNextLevel: pointsToNextLevel,
          progress: levelProgress,
          rank: userProfile?.rank || 0,
          solvedMachines: userProfile?.solved_machines || 0,
          completedChallenges: userProfile?.completed_challenges || 0
        }} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                Dashboard
              </h1>
              <p className="text-gray-400">
                Bienvenido{userProfile?.username ? ` ${userProfile.username}` : ''}, aquí tienes un resumen de tu progreso.
              </p>
            </header>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard 
                title="Máquinas Resueltas" 
                value={userProfile?.solved_machines || 0} 
                icon={<Database className="h-4 w-4 text-cybersec-neongreen" />} 
                colorClass="text-cybersec-neongreen"
                description={(userProfile?.solved_machines || 0) > 0 ? "¡Sigue así!" : "¡Comienza a resolver máquinas!"}
              />
              <StatsCard 
                title="Puntos Totales" 
                value={userProfile?.points || 0} 
                icon={<Trophy className="h-4 w-4 text-cybersec-yellow" />} 
                colorClass="text-cybersec-yellow"
                description={userProfile?.rank ? `Rank #${userProfile.rank} global` : "Sin clasificación aún"}
              />
              <StatsCard 
                title="Desafíos Completados" 
                value={userProfile?.completed_challenges || 0} 
                icon={<Flag className="h-4 w-4 text-cybersec-red" />} 
                colorClass="text-cybersec-red"
                description={activeChallenge ? "1 desafío activo" : "Sin desafíos activos"}
              />
              <StatsCard 
                title="Nivel Actual" 
                value={userProfile?.level || 1} 
                icon={<Shield className="h-4 w-4 text-cybersec-electricblue" />} 
                colorClass="text-cybersec-electricblue"
                description={`${pointsToNextLevel} pts para nivel ${(userProfile?.level || 1) + 1}`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna izquierda */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-cybersec-neongreen">Máquinas Recomendadas</CardTitle>
                        <CardDescription>Basado en tu nivel y habilidades</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="border-cybersec-neongreen text-cybersec-neongreen" asChild>
                        <Link to="/machines">Ver todas</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedMachines.map((machine) => (
                      <MachineCard key={machine.id} {...machine} />
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cybersec-neongreen">Progreso de Nivel</CardTitle>
                    <CardDescription>
                      {userProfile?.points || 0} / {(userProfile?.points || 0) + pointsToNextLevel} puntos para Nivel {(userProfile?.level || 1) + 1}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={levelProgress} className="h-2 mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-cybersec-black p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Nivel actual</div>
                        <div className="flex items-center">
                          <Shield className="h-5 w-5 text-cybersec-electricblue mr-2" />
                          <span className="text-xl font-bold text-cybersec-electricblue">{userProfile?.level || 1}</span>
                        </div>
                      </div>
                      <div className="bg-cybersec-black p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Puntos restantes</div>
                        <div className="text-xl font-bold text-cybersec-yellow">{pointsToNextLevel}</div>
                      </div>
                      <div className="bg-cybersec-black p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Rank global</div>
                        <div className="text-xl font-bold text-cybersec-neongreen">#{userProfile?.rank || '-'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Columna derecha */}
              <div className="space-y-6">
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardHeader>
                    <CardTitle className="text-cybersec-neongreen">Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start border-b border-cybersec-darkgray/50 pb-3 last:border-0 last:pb-0">
                            <div className="p-2 rounded-full bg-cybersec-black mr-3">
                              {activity.type === 'machine_completed' && <Database className="h-4 w-4 text-cybersec-neongreen" />}
                              {activity.type === 'badge_earned' && <Trophy className="h-4 w-4 text-cybersec-yellow" />}
                              {activity.type === 'challenge_completed' && <Flag className="h-4 w-4 text-cybersec-red" />}
                              {activity.type === 'level_up' && <Shield className="h-4 w-4 text-cybersec-electricblue" />}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <span className="font-medium">{activity.title}</span>
                                {activity.points > 0 && (
                                  <span className="text-cybersec-neongreen text-sm">+{activity.points}</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400">{activity.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No hay actividad reciente</p>
                        <p className="text-xs mt-1">¡Comienza a resolver máquinas y desafíos!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-cybersec-neongreen">Insignias</CardTitle>
                      <Button variant="ghost" size="sm" className="text-cybersec-electricblue">
                        Ver todas
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="earned">
                      <TabsList className="bg-cybersec-black mb-4">
                        <TabsTrigger value="earned" className="data-[state=active]:bg-cybersec-darkgray data-[state=active]:text-cybersec-neongreen">
                          Obtenidas
                        </TabsTrigger>
                        <TabsTrigger value="progress" className="data-[state=active]:bg-cybersec-darkgray data-[state=active]:text-cybersec-neongreen">
                          En progreso
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="earned" className="grid grid-cols-2 gap-4">
                        {badges.filter(badge => badge.earned).length > 0 ? (
                          badges.filter(badge => badge.earned).map((badge) => (
                            <BadgeCard key={badge.id} badge={badge} />
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-4 text-gray-400">
                            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No tienes insignias aún</p>
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="progress" className="grid grid-cols-2 gap-4">
                        {badges.filter(badge => !badge.earned).length > 0 ? (
                          badges.filter(badge => !badge.earned).map((badge) => (
                            <BadgeCard key={badge.id} badge={badge} />
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-4 text-gray-400">
                            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay insignias en progreso</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card className="bg-cybersec-darkgray border-cybersec-darkgray neon-border-blue">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cybersec-electricblue flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Desafío Semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeChallenge ? (
                      <>
                        <p className="text-sm mb-3">
                          {activeChallenge.title}: Completa {activeChallenge.total} máquinas y gana puntos extra.
                        </p>
                        <Progress value={(activeChallenge.progress / activeChallenge.total) * 100} className="h-2 mb-3" />
                        <div className="flex justify-between text-sm">
                          <span>{activeChallenge.progress}/{activeChallenge.total} completadas</span>
                          <span className="text-cybersec-yellow">+{activeChallenge.points} pts</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm mb-3">
                        No hay desafíos semanales activos en este momento. ¡Vuelve pronto para ver nuevos desafíos!
                      </p>
                    )}
                    <Button className="w-full mt-4 bg-cybersec-darkgray border border-cybersec-electricblue text-cybersec-electricblue hover:bg-cybersec-electricblue hover:text-cybersec-black" asChild>
                      <Link to="/challenges">Ver desafío</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
