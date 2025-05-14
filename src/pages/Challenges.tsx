import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, Flag, HelpCircle, Trophy, Shield } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { queries } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ChallengeService } from '@/components/challenges/ChallengeService';
import ChallengeCard, { Challenge } from '@/components/challenges/ChallengeCard';

const Challenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    pointsToNextLevel: 500,
    progress: 0,
    rank: 0,
    solvedMachines: 0,
    completedChallenges: 0,
  });

  // Fetch user profile data and challenges
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch user profile data
        const profileData = await queries.getUserProfile(user.id);
          
        if (profileData) {
          console.log("Profile data loaded in Challenges:", profileData);
          
          // Calculate points to next level (nivel actual * 500)
          const pointsToNextLevel = profileData.level * 500 - profileData.points;
          
          // Calculate progress as percentage
          const levelProgress = Math.min(
            Math.round((profileData.points / (profileData.level * 500)) * 100),
            100
          );
          
          setUserStats({
            level: profileData.level || 1,
            points: profileData.points || 0,
            pointsToNextLevel: pointsToNextLevel,
            progress: levelProgress,
            rank: profileData.rank || 0,
            solvedMachines: profileData.solved_machines || 0,
            completedChallenges: profileData.completed_challenges || 0,
          });
        }
        
        // Fetch challenges with completion status
        const fetchedChallenges = await ChallengeService.getChallenges(user.id);
        console.log("Challenges loaded with completion status:", fetchedChallenges);
        setChallenges(fetchedChallenges);
      } catch (error) {
        console.error('Error loading profile in Challenges:', error);
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar tus datos de perfil o desafíos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const categories = [...new Set(challenges.map(challenge => challenge.category))];
  const weeklyChallenge = challenges.find(c => c.isActive) || challenges[0]; // Use first challenge as fallback

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cybersec-black">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar userStats={userStats} />
          <main className="flex-1 md:ml-64 p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold text-cybersec-neongreen">Cargando desafíos...</h1>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                    Desafíos
                  </h1>
                  <p className="text-gray-400">
                    Pon a prueba tus habilidades con desafíos de ciberseguridad
                  </p>
                </div>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="bg-cybersec-darkgray hover:bg-cybersec-darkgray/80">Ayuda</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[400px] max-w-[calc(100vw-2rem)] gap-3 p-6 bg-cybersec-darkgray">
                          <div className="row-span-3">
                            <NavigationMenuLink asChild>
                              <a
                                className="flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b from-cybersec-darkgray/50 to-cybersec-black p-6 no-underline outline-none focus:shadow-md"
                                href="#"
                              >
                                <HelpCircle className="h-6 w-6 text-cybersec-neongreen mb-2" />
                                <div className="mb-2 mt-4 text-lg font-medium text-cybersec-neongreen">
                                  Guía de desafíos
                                </div>
                                <p className="text-sm leading-tight text-gray-400">
                                  Aprende cómo funcionan los desafíos, cómo resolverlos y cómo ganar puntos.
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </div>
                          <Link to="/tutorials">
                            <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-cybersec-black hover:text-cybersec-neongreen">
                              <div className="text-sm font-medium leading-none">Tutoriales</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-400">
                                Tutoriales guiados para aprender ciberseguridad.
                              </p>
                            </div>
                          </Link>
                          <Link to="/security">
                            <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-cybersec-black hover:text-cybersec-neongreen">
                              <div className="text-sm font-medium leading-none">Centro de recursos</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-400">
                                Documentación, guías y recursos adicionales.
                              </p>
                            </div>
                          </Link>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Desafíos activos</span>
                        <span className="text-2xl font-bold text-cybersec-neongreen">
                          {challenges.filter(c => c.isActive).length}
                        </span>
                      </div>
                      <div className="p-3 bg-cybersec-black rounded-full">
                        <Flag className="h-5 w-5 text-cybersec-neongreen" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Completados</span>
                        <span className="text-2xl font-bold text-cybersec-yellow">
                          {challenges.filter(c => c.isCompleted).length}
                        </span>
                      </div>
                      <div className="p-3 bg-cybersec-black rounded-full">
                        <Check className="h-5 w-5 text-cybersec-yellow" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Puntos ganados</span>
                        <span className="text-2xl font-bold text-cybersec-electricblue">
                          {userStats.points}
                        </span>
                      </div>
                      <div className="p-3 bg-cybersec-black rounded-full">
                        <Trophy className="h-5 w-5 text-cybersec-electricblue" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Progreso general</span>
                        <span className="text-2xl font-bold text-cybersec-neongreen">
                          {challenges.length > 0 
                            ? Math.round((challenges.filter(c => c.isCompleted).length / challenges.length) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="p-3 bg-cybersec-black rounded-full">
                        <Shield className="h-5 w-5 text-cybersec-neongreen" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {weeklyChallenge && (
                <Card className="bg-cybersec-darkgray border-cybersec-darkgray mb-6">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-cybersec-yellow" />
                      <CardTitle className="text-cybersec-yellow">Desafío Semanal</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{weeklyChallenge.title}</h3>
                        <p className="text-gray-400 mb-4">{weeklyChallenge.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="bg-cybersec-black text-cybersec-yellow">
                            {weeklyChallenge.category}
                          </Badge>
                          <Badge variant="secondary" className="bg-cybersec-black">
                            {weeklyChallenge.points} pts
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="default" className="bg-cybersec-yellow text-cybersec-black hover:bg-cybersec-yellow/80">
                            {weeklyChallenge.isCompleted ? 'Ver detalles' : 'Comenzar desafío'}
                          </Button>
                          <p className="text-sm text-gray-400">
                            <span className="font-semibold">{weeklyChallenge.participants}</span> participantes
                          </p>
                        </div>
                      </div>
                      <div className="md:w-1/3 flex flex-col justify-center">
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-gray-400">Tiempo restante</span>
                          <span className="text-cybersec-yellow">3 días, 8 horas</span>
                        </div>
                        <Progress value={65} className="h-2 mb-4" />
                        <div className="p-3 bg-cybersec-black rounded-lg text-center">
                          <span className="block text-sm text-gray-400">Recompensa</span>
                          <span className="text-lg font-bold text-cybersec-yellow">+{weeklyChallenge.points * 2} pts</span>
                          <span className="block text-xs text-gray-400">+ Badge exclusivo</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </header>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 bg-cybersec-darkgray">
                <TabsTrigger value="all" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">Todos</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {challenges.map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>

              {categories.map(category => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {challenges
                      .filter(challenge => challenge.category === category)
                      .map(challenge => (
                        <ChallengeCard key={challenge.id} challenge={challenge} />
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Challenges;
