
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

const Challenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    pointsToNextLevel: 500,
    progress: 0,
    rank: 0,
    solvedMachines: 0,
    completedChallenges: 0,
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const profileData = await queries.getUserProfile(user.id);
          
        if (profileData) {
          console.log("Profile data loaded in Challenges:", profileData);
          
          // Calculate points to next level (simple: nivel actual * 500)
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
        } else {
          console.error('No profile data returned');
          toast({
            title: "Error al cargar perfil",
            description: "No se pudieron cargar tus datos de perfil.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading profile in Challenges:', error);
        toast({
          title: "Error al cargar perfil",
          description: "No se pudieron cargar tus datos de perfil.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  const [challenges, setChallenges] = useState([
    { 
      id: 1, 
      title: 'Web Exploitation 101', 
      category: 'Web', 
      points: 100, 
      solved: true,
      description: 'Explora vulnerabilidades comunes en aplicaciones web como XSS, CSRF, SQLi y más.',
      deadline: '2023-06-20',
      difficulty: 'easy',
      participants: 235
    },
    { 
      id: 2, 
      title: 'Reverse Engineering Basics', 
      category: 'Reverse Engineering', 
      points: 150, 
      solved: false,
      description: 'Aprende a analizar binarios y comprender su funcionamiento interno mediante técnicas de ingeniería inversa.',
      deadline: '2023-06-25',
      difficulty: 'medium',
      participants: 187
    },
    { 
      id: 3, 
      title: 'Cryptography Challenges', 
      category: 'Cryptography', 
      points: 200, 
      solved: false,
      description: 'Desafíos para romper esquemas criptográficos mal implementados y entender algoritmos criptográficos.',
      deadline: '2023-06-30',
      difficulty: 'hard',
      participants: 156
    },
    { 
      id: 4, 
      title: 'Network Analysis', 
      category: 'Network', 
      points: 120, 
      solved: true,
      description: 'Analiza capturas de paquetes para encontrar información relevante y detectar anomalías en el tráfico de red.',
      deadline: '2023-06-18',
      difficulty: 'medium',
      participants: 203
    },
    { 
      id: 5, 
      title: 'OSINT Challenge', 
      category: 'OSINT', 
      points: 180, 
      solved: false,
      description: 'Utiliza técnicas de recopilación de inteligencia de fuentes abiertas para encontrar información oculta.',
      deadline: '2023-07-05',
      difficulty: 'medium',
      participants: 178
    },
    { 
      id: 6, 
      title: 'Binary Exploitation', 
      category: 'Exploitation', 
      points: 250, 
      solved: false,
      description: 'Explota vulnerabilidades en aplicaciones binarias utilizando técnicas como buffer overflows y ROP.',
      deadline: '2023-07-10',
      difficulty: 'hard',
      participants: 124
    },
  ]);

  const categories = [...new Set(challenges.map(challenge => challenge.category))];
  const weeklyChallenge = challenges[5]; // Binary Exploitation como desafío semanal

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyBadgeVariant = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'outline';
      case 'medium': return 'secondary';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };

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
                        <ul className="grid gap-3 p-6 w-[400px] bg-cybersec-darkgray">
                          <li className="row-span-3">
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
                          </li>
                          <li>
                            <Link to="/tutorials">
                              <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-cybersec-black hover:text-cybersec-neongreen">
                                <div className="text-sm font-medium leading-none">Tutoriales</div>
                                <p className="line-clamp-2 text-sm leading-snug text-gray-400">
                                  Tutoriales guiados para aprender ciberseguridad.
                                </p>
                              </div>
                            </Link>
                          </li>
                          <li>
                            <Link to="/security">
                              <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-cybersec-black hover:text-cybersec-neongreen">
                                <div className="text-sm font-medium leading-none">Centro de recursos</div>
                                <p className="line-clamp-2 text-sm leading-snug text-gray-400">
                                  Documentación, guías y recursos adicionales.
                                </p>
                              </div>
                            </Link>
                          </li>
                        </ul>
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
                        <span className="text-2xl font-bold text-cybersec-neongreen">{challenges.length}</span>
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
                        <span className="text-2xl font-bold text-cybersec-yellow">{userStats.completedChallenges}</span>
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
                          {Math.round((userStats.completedChallenges / challenges.length) * 100) || 0}%
                        </span>
                      </div>
                      <div className="p-3 bg-cybersec-black rounded-full">
                        <Shield className="h-5 w-5 text-cybersec-neongreen" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

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
                        <Badge variant={getDifficultyBadgeVariant(weeklyChallenge.difficulty)} className="bg-cybersec-black">
                          {weeklyChallenge.difficulty.charAt(0).toUpperCase() + weeklyChallenge.difficulty.slice(1)}
                        </Badge>
                        <Badge variant="secondary" className="bg-cybersec-black">
                          {weeklyChallenge.points} pts
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button variant="default" className="bg-cybersec-yellow text-cybersec-black hover:bg-cybersec-yellow/80">
                          Comenzar desafío
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
                    <Card key={challenge.id} className="bg-cybersec-darkgray border-cybersec-darkgray hover:border-cybersec-neongreen/50 transition-all">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-start">
                          <span className="flex-1">{challenge.title}</span>
                          {challenge.solved && (
                            <Badge variant="secondary" className="ml-2">
                              <Check className="h-4 w-4 mr-2" />
                              Resuelto
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>Categoría: {challenge.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-400 mb-4">{challenge.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant={getDifficultyBadgeVariant(challenge.difficulty)} className="bg-cybersec-black">
                            <span className={cn("mr-1", getDifficultyColor(challenge.difficulty))}>•</span>
                            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                          </Badge>
                          <Badge variant="secondary" className="bg-cybersec-black">
                            <Trophy className="h-3 w-3 mr-1" />
                            {challenge.points} pts
                          </Badge>
                          <Badge variant="outline" className="bg-cybersec-black">
                            {challenge.participants} participantes
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400 flex justify-between items-center">
                          <span>Fecha límite: {new Date(challenge.deadline).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="justify-between">
                        <Button variant="default" className="bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80">
                          {challenge.solved ? 'Ver solución' : 'Comenzar'}
                        </Button>
                        {!challenge.solved && (
                          <Button variant="outline" className="border-cybersec-neongreen text-cybersec-neongreen">
                            Pistas
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {categories.map(category => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {challenges
                      .filter(challenge => challenge.category === category)
                      .map(challenge => (
                        <Card key={challenge.id} className="bg-cybersec-darkgray border-cybersec-darkgray hover:border-cybersec-neongreen/50 transition-all">
                          <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                              <span className="flex-1">{challenge.title}</span>
                              {challenge.solved && (
                                <Badge variant="secondary" className="ml-2">
                                  <Check className="h-4 w-4 mr-2" />
                                  Resuelto
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>Categoría: {challenge.category}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-400 mb-4">{challenge.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant={getDifficultyBadgeVariant(challenge.difficulty)} className="bg-cybersec-black">
                                <span className={cn("mr-1", getDifficultyColor(challenge.difficulty))}>•</span>
                                {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                              </Badge>
                              <Badge variant="secondary" className="bg-cybersec-black">
                                <Trophy className="h-3 w-3 mr-1" />
                                {challenge.points} pts
                              </Badge>
                              <Badge variant="outline" className="bg-cybersec-black">
                                {challenge.participants} participantes
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-400 flex justify-between items-center">
                              <span>Fecha límite: {new Date(challenge.deadline).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="justify-between">
                            <Button variant="default" className="bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80">
                              {challenge.solved ? 'Ver solución' : 'Comenzar'}
                            </Button>
                            {!challenge.solved && (
                              <Button variant="outline" className="border-cybersec-neongreen text-cybersec-neongreen">
                                Pistas
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
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
