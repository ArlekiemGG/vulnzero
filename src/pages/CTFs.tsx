
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Flag, Trophy, Shield, Clock, Calendar, Users, ExternalLink, Swords, Timer } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

// Type for user stats - making sure it aligns with what Sidebar expects
interface UserStats {
  level: number;
  points: number;
  pointsToNextLevel: number;
  progress: number;
  rank: number; // Required to match what Sidebar expects
  solvedMachines: number;
  completedChallenges: number;
}

// Interface for CTF data structure
interface CTF {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  organizer: string;
  difficulty: string;
  registered: boolean;
  challenges: number;
  participants: number;
  maxPoints: number;
  userPoints?: number;
  format: string;
  image: string;
  rank?: number;
  totalParticipants?: number;
}

// Interface for leaderboard entry
interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  solved: number;
  isCurrentUser?: boolean;
}

const CTFs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    points: 0,
    pointsToNextLevel: 100,
    progress: 0,
    rank: 0,
    solvedMachines: 0,
    completedChallenges: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCTFs, setActiveCTFs] = useState<CTF[]>([]);
  const [pastCTFs, setPastCTFs] = useState<CTF[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userActiveCTF, setUserActiveCTF] = useState<CTF | null>(null);

  // Función para obtener CTFs registrados por el usuario
  const fetchUserCTFs = async (userId: string) => {
    // En una implementación real, esto vendría de la base de datos
    // Por ahora, simulamos que el usuario no tiene CTFs registrados
    return [];
  };

  // Función para obtener datos simulados de CTFs
  const fetchCTFsData = async () => {
    // Estos son datos de ejemplo - en una implementación real vendrían de la base de datos
    const activeCTFsData: CTF[] = [
      {
        id: 1,
        name: 'Weekly Web Challenge',
        description: 'Desafío semanal con foco en vulnerabilidades web modernas.',
        startDate: '2023-06-01T08:00:00',
        endDate: '2023-06-08T20:00:00',
        type: 'Jeopardy',
        organizer: 'CyberChallenge',
        difficulty: 'Intermedio',
        registered: false,
        challenges: 8,
        participants: 342,
        maxPoints: 1000,
        format: 'Individual',
        image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=320&auto=format&fit=crop'
      },
      {
        id: 2,
        name: 'Network Defenders 2023',
        description: 'CTF centrado en seguridad de redes y detección de intrusiones.',
        startDate: '2023-06-05T10:00:00',
        endDate: '2023-06-07T18:00:00',
        type: 'Attack-Defense',
        organizer: 'NetworkSec Community',
        difficulty: 'Avanzado',
        registered: false,
        challenges: 12,
        participants: 156,
        maxPoints: 2000,
        format: 'Equipo',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=320&auto=format&fit=crop'
      },
      {
        id: 3,
        name: 'Crypto Masters',
        description: 'Competición de criptografía con desafíos desde clásicos hasta modernos.',
        startDate: '2023-06-10T09:00:00',
        endDate: '2023-06-12T21:00:00',
        type: 'Jeopardy',
        organizer: 'CryptoAlliance',
        difficulty: 'Experto',
        registered: false,
        challenges: 10,
        participants: 98,
        maxPoints: 1500,
        format: 'Individual/Equipo',
        image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=320&auto=format&fit=crop'
      }
    ];

    const pastCTFsData: CTF[] = [
      {
        id: 4,
        name: 'Binary Exploitation Challenge',
        description: 'CTF enfocado en explotación binaria y vulnerabilidades de memoria.',
        startDate: '2023-05-15T08:00:00',
        endDate: '2023-05-18T20:00:00',
        type: 'Jeopardy',
        organizer: 'Pwners Club',
        difficulty: 'Avanzado',
        challenges: 15,
        participants: 203,
        maxPoints: 2500,
        userPoints: 0,
        rank: 0,
        totalParticipants: 203,
        format: 'Individual',
        registered: false,
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=320&auto=format&fit=crop'
      },
      {
        id: 5,
        name: 'Mobile Security Showdown',
        description: 'Competición centrada en seguridad de aplicaciones móviles Android e iOS.',
        startDate: '2023-04-22T10:00:00',
        endDate: '2023-04-24T18:00:00',
        type: 'Jeopardy',
        organizer: 'MobileSec Initiative',
        difficulty: 'Intermedio',
        challenges: 10,
        participants: 175,
        maxPoints: 1000,
        userPoints: 0,
        rank: 0,
        totalParticipants: 175,
        format: 'Individual',
        registered: false,
        image: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?q=80&w=320&auto=format&fit=crop'
      },
      {
        id: 6,
        name: 'Cloud Security Challenge',
        description: 'CTF sobre seguridad en entornos cloud con AWS, Azure y GCP.',
        startDate: '2023-05-01T09:00:00',
        endDate: '2023-05-05T21:00:00',
        type: 'Jeopardy',
        organizer: 'Cloud Security Alliance',
        difficulty: 'Avanzado',
        challenges: 12,
        participants: 145,
        maxPoints: 2000,
        userPoints: 0,
        rank: 0,
        totalParticipants: 145,
        format: 'Equipo',
        registered: false,
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=320&auto=format&fit=crop'
      }
    ];

    return { activeCTFsData, pastCTFsData };
  };

  // Función para obtener datos simulados de la clasificación
  const fetchLeaderboardData = async () => {
    try {
      // Obtenemos los datos reales del leaderboard desde Supabase
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Convertimos los datos a nuestro formato de leaderboard
      const leaderboardData: LeaderboardEntry[] = profiles.map((profile, index) => ({
        rank: index + 1,
        name: profile.username || `Usuario ${profile.id.substring(0, 5)}`,
        points: profile.points || 0,
        solved: profile.solved_machines || 0,
        isCurrentUser: user && profile.id === user.id
      }));

      // Si el usuario actual no está en el top 5, añadirlo al final
      if (user && !leaderboardData.some(entry => entry.isCurrentUser)) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userProfile) {
          // Obtenemos el rank del usuario (posición en el leaderboard global)
          const { count: userRank } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gt('points', userProfile.points || 0);

          leaderboardData.push({
            rank: (userRank || 0) + 1,
            name: userProfile.username || `Usuario ${userProfile.id.substring(0, 5)}`,
            points: userProfile.points || 0,
            solved: userProfile.solved_machines || 0,
            isCurrentUser: true
          });
        }
      }

      return leaderboardData;
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return []; // Retornamos array vacío en caso de error
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (profile) {
          // Calculate progress to next level (simple formula: need 500 points per level)
          const pointsPerLevel = 500;
          const currentLevelPoints = (profile.level - 1) * pointsPerLevel;
          const nextLevelPoints = profile.level * pointsPerLevel;
          const pointsInCurrentLevel = profile.points - currentLevelPoints;
          const progressToNextLevel = Math.min(100, Math.round((pointsInCurrentLevel / pointsPerLevel) * 100));
          
          setUserStats({
            level: profile.level || 1,
            points: profile.points || 0,
            pointsToNextLevel: nextLevelPoints - profile.points,
            progress: progressToNextLevel,
            rank: profile.rank || 0,
            solvedMachines: profile.solved_machines || 0,
            completedChallenges: profile.completed_challenges || 0,
          });
        }

        // Cargamos los datos de CTFs
        const { activeCTFsData, pastCTFsData } = await fetchCTFsData();
        
        // Verificamos si el usuario tiene CTFs registrados
        if (user) {
          const userCTFs = await fetchUserCTFs(user.id);
          
          // Actualizamos los CTFs activos con la información de registro del usuario
          // Como aún no tenemos tabla de registro, ninguno aparecerá como registrado
          setActiveCTFs(activeCTFsData);
          setPastCTFs(pastCTFsData);
          
          // No establecemos ningún CTF activo para el usuario
          setUserActiveCTF(null);
        } else {
          setActiveCTFs(activeCTFsData);
          setPastCTFs(pastCTFsData);
        }
        
        // Cargamos los datos del leaderboard
        const leaderboardData = await fetchLeaderboardData();
        setLeaderboard(leaderboardData);

      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus datos de perfil.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Mismo día
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString()} · ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    // Diferentes días
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Principiante': return 'bg-green-500/20 text-green-500 border-green-500';
      case 'Intermedio': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
      case 'Avanzado': return 'bg-orange-500/20 text-orange-500 border-orange-500';
      case 'Experto': return 'bg-red-500/20 text-red-500 border-red-500';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500';
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Finalizado';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHrs}h restantes`;
    }
    return `${diffHrs}h ${diffMins}m restantes`;
  };

  const hasStarted = (startDate: string) => {
    return new Date(startDate) <= new Date();
  };

  const handleRegisterCTF = (ctfId: number) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para registrarte en un CTF.",
        variant: "default"
      });
      navigate('/auth');
      return;
    }

    // En una implementación real, aquí se registraría al usuario en el CTF
    toast({
      title: "Registro pendiente",
      description: "La funcionalidad de registro en CTFs estará disponible próximamente.",
      variant: "default"
    });
  };

  const handleResourcesClick = () => {
    // Update to a working CTF resources URL
    window.open('https://ctftime.org/ctf-wtf/', '_blank');
  };

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                Capture The Flag (CTF)
              </h1>
              <p className="text-gray-400">
                Demuestra tus habilidades en competiciones de ciberseguridad
              </p>
            </header>

            {/* CTF activo del usuario - solo se muestra si el usuario tiene uno activo */}
            {loading ? (
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray mb-6">
                <CardHeader>
                  <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-8 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      
                      <div className="mt-8">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-2 w-full mb-4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              userActiveCTF && (
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray mb-6">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Swords className="h-5 w-5 text-cybersec-yellow" />
                      <CardTitle className="text-cybersec-yellow">CTF en progreso</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <div className="h-48 rounded-lg overflow-hidden mb-3">
                          <img 
                            src={userActiveCTF.image} 
                            alt={userActiveCTF.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-gray-400">Formato</div>
                            <div>{userActiveCTF.format}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Tipo</div>
                            <div>{userActiveCTF.type}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Desafíos</div>
                            <div>{userActiveCTF.challenges}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Participantes</div>
                            <div>{userActiveCTF.participants}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-cybersec-yellow">{userActiveCTF.name}</h3>
                            <Badge className={cn("border", getDifficultyColor(userActiveCTF.difficulty))}>
                              {userActiveCTF.difficulty}
                            </Badge>
                          </div>
                          <p className="text-gray-400 mb-4">{userActiveCTF.description}</p>
                          
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                            <div className="flex items-center text-sm text-gray-300">
                              <Calendar className="h-4 w-4 mr-2 text-cybersec-yellow" />
                              <span>{formatDateRange(userActiveCTF.startDate, userActiveCTF.endDate)}</span>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-cybersec-yellow">
                              <Timer className="h-4 w-4 mr-2" />
                              <span>{getTimeRemaining(userActiveCTF.endDate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Tu progreso</span>
                              <span className="text-cybersec-yellow">
                                {userActiveCTF.userPoints || 0} / {userActiveCTF.maxPoints} puntos
                              </span>
                            </div>
                            <Progress 
                              value={((userActiveCTF.userPoints || 0) / userActiveCTF.maxPoints) * 100} 
                              className="h-2" 
                            />
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <Button className="bg-cybersec-yellow text-cybersec-black hover:bg-cybersec-yellow/80 flex-1">
                              Continuar CTF
                            </Button>
                            <Button variant="outline" className="border-cybersec-yellow text-cybersec-yellow">
                              Ver clasificación
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="mb-4 bg-cybersec-darkgray">
                <TabsTrigger 
                  value="upcoming" 
                  className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                >
                  Próximos CTFs
                </TabsTrigger>
                <TabsTrigger 
                  value="past" 
                  className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                >
                  CTFs pasados
                </TabsTrigger>
              </TabsList>

              {/* Próximos CTFs */}
              <TabsContent value="upcoming">
                {loading ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="bg-cybersec-darkgray border-cybersec-darkgray">
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="pt-4">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-4" />
                          <div className="grid grid-cols-2 gap-y-3 mb-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                          </div>
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-10 w-1/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {activeCTFs.map(ctf => (
                      <Card key={ctf.id} className="bg-cybersec-darkgray border-cybersec-darkgray hover:border-cybersec-electricblue/50 transition-all overflow-hidden">
                        <div className="h-48 relative">
                          <img 
                            src={ctf.image} 
                            alt={ctf.name} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-white">{ctf.name}</h3>
                              <Badge className={cn("border", getDifficultyColor(ctf.difficulty))}>
                                {ctf.difficulty}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-2 line-clamp-2">{ctf.description}</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="bg-black/50">
                                {ctf.type}
                              </Badge>
                              <Badge variant="outline" className="bg-black/50 border-gray-500">
                                {ctf.format}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-y-3 mb-4 text-sm">
                            <div>
                              <div className="text-gray-400">Organiza</div>
                              <div>{ctf.organizer}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Participantes</div>
                              <div className="flex items-center">
                                <Users className="h-3.5 w-3.5 mr-1.5 text-cybersec-electricblue" />
                                {ctf.participants}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400">Fecha</div>
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-cybersec-electricblue" />
                                {new Date(ctf.startDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400">Desafíos</div>
                              <div className="flex items-center">
                                <Flag className="h-3.5 w-3.5 mr-1.5 text-cybersec-electricblue" />
                                {ctf.challenges}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-semibold">
                              {hasStarted(ctf.startDate) 
                                ? <span className="text-cybersec-neongreen">Disponible ahora</span>
                                : <span className="text-cybersec-electricblue">Comienza en {Math.ceil((new Date(ctf.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días</span>}
                            </div>
                            <Button 
                              className={ctf.registered 
                                ? "border-cybersec-neongreen text-cybersec-neongreen bg-transparent hover:bg-cybersec-neongreen/10"
                                : "bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80"}
                              variant={ctf.registered ? "outline" : "default"}
                              onClick={() => handleRegisterCTF(ctf.id)}
                            >
                              {ctf.registered ? 'Registrado' : 'Registrarse'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* CTFs pasados */}
              <TabsContent value="past">
                {loading ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="bg-cybersec-darkgray border-cybersec-darkgray">
                        <Skeleton className="h-36 w-full" />
                        <CardContent className="pt-4">
                          <Skeleton className="h-4 w-full mb-3" />
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                          <Skeleton className="h-10 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {pastCTFs.map(ctf => (
                      <Card key={ctf.id} className="bg-cybersec-darkgray border-cybersec-darkgray overflow-hidden">
                        <div className="h-36 relative">
                          <img 
                            src={ctf.image} 
                            alt={ctf.name} 
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="text-xl font-bold text-white">{ctf.name}</h3>
                              <Badge className={cn("border", getDifficultyColor(ctf.difficulty))}>
                                {ctf.difficulty}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="bg-black/50">
                                {ctf.type}
                              </Badge>
                              <Badge variant="outline" className="bg-black/50 border-gray-500">
                                {ctf.format}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <CardContent className="pt-4">
                          <div className="mb-3">
                            <p className="text-sm text-gray-400 line-clamp-2">{ctf.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                            <div className="bg-cybersec-black p-2 rounded">
                              <div className="text-xs text-gray-400 mb-0.5">Posición</div>
                              <div className="font-semibold flex items-center">
                                <Trophy className="h-3.5 w-3.5 mr-1.5 text-cybersec-yellow" />
                                {ctf.rank || "N/A"}/{ctf.totalParticipants || "N/A"}
                              </div>
                            </div>
                            <div className="bg-cybersec-black p-2 rounded">
                              <div className="text-xs text-gray-400 mb-0.5">Puntos</div>
                              <div className="font-semibold">{ctf.userPoints || 0}/{ctf.maxPoints}</div>
                            </div>
                            <div className="bg-cybersec-black p-2 rounded">
                              <div className="text-xs text-gray-400 mb-0.5">Participantes</div>
                              <div className="flex items-center">
                                <Users className="h-3.5 w-3.5 mr-1" />
                                {ctf.participants}
                              </div>
                            </div>
                            <div className="bg-cybersec-black p-2 rounded">
                              <div className="text-xs text-gray-400 mb-0.5">Fecha</div>
                              <div className="text-nowrap truncate">
                                {new Date(ctf.startDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            className="w-full border-cybersec-electricblue text-cybersec-electricblue"
                          >
                            Ver detalles
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
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

              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-cybersec-electricblue" />
                    <CardTitle className="text-cybersec-electricblue">Guía para CTFs</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="bg-cybersec-black p-2 rounded-full mr-3">
                        <Flag className="h-4 w-4 text-cybersec-electricblue" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">¿Qué es un CTF?</h4>
                        <p className="text-sm text-gray-400">
                          Capture The Flag es una competición de seguridad donde los participantes resuelven desafíos para encontrar "flags" ocultas.
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-cybersec-darkgray/50" />
                    <div className="flex items-start">
                      <div className="bg-cybersec-black p-2 rounded-full mr-3">
                        <Swords className="h-4 w-4 text-cybersec-electricblue" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Tipos de CTF</h4>
                        <p className="text-sm text-gray-400">
                          <span className="text-cybersec-electricblue">Jeopardy:</span> Desafíos independientes por categorías. <br />
                          <span className="text-cybersec-electricblue">Attack-Defense:</span> Equipos protegen sus sistemas mientras atacan otros.
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-cybersec-darkgray/50" />
                    <div className="flex items-start">
                      <div className="bg-cybersec-black p-2 rounded-full mr-3">
                        <Trophy className="h-4 w-4 text-cybersec-electricblue" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Consejos para competir</h4>
                        <p className="text-sm text-gray-400">
                          Forma un equipo con habilidades diversas, documenta lo que intentas, y no te rindas con los desafíos más difíciles.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-cybersec-electricblue text-cybersec-black hover:bg-cybersec-electricblue/80"
                    onClick={handleResourcesClick}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Recursos para CTFs
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CTFs;
