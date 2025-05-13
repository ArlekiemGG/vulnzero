
import React from 'react';
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

// Mock data para estadísticas de usuario
const userStats = {
  level: 7,
  points: 3450,
  pointsToNextLevel: 550,
  progress: 70,
  rank: 42,
  solvedMachines: 15,
  completedChallenges: 8,
};

// Mock data para CTFs activos
const activeCTFs = [
  {
    id: 1,
    name: 'Weekly Web Challenge',
    description: 'Desafío semanal con foco en vulnerabilidades web modernas.',
    startDate: '2023-06-01T08:00:00',
    endDate: '2023-06-08T20:00:00',
    type: 'Jeopardy',
    organizer: 'CyberChallenge',
    difficulty: 'Intermedio',
    registered: true,
    challenges: 8,
    participants: 342,
    maxPoints: 1000,
    userPoints: 350,
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

// Mock data para CTFs pasados
const pastCTFs = [
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
    userPoints: 1800,
    rank: 12,
    totalParticipants: 203,
    format: 'Individual',
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
    userPoints: 650,
    rank: 28,
    totalParticipants: 175,
    format: 'Individual',
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
    userPoints: 1350,
    rank: 15,
    totalParticipants: 145,
    format: 'Equipo',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=320&auto=format&fit=crop'
  }
];

// Mock data para tabla de clasificación del último CTF
const currentCTFLeaderboard = [
  { rank: 1, name: "HackerElite", points: 850, solved: 7 },
  { rank: 2, name: "ByteBrigade", points: 790, solved: 6 },
  { rank: 3, name: "CryptoKings", points: 725, solved: 6 },
  { rank: 4, name: "BinaryNinjas", points: 680, solved: 5 },
  { rank: 5, name: "WebWarriors", points: 620, solved: 5 },
  { rank: 14, name: "YourUsername", points: 350, solved: 3, isCurrentUser: true }
];

const CTFs = () => {
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

  const activeCTF = activeCTFs[0]; // CTF activo del usuario

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

            {/* CTF activo del usuario */}
            {activeCTF && activeCTF.registered && (
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
                          src={activeCTF.image} 
                          alt={activeCTF.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-gray-400">Formato</div>
                          <div>{activeCTF.format}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Tipo</div>
                          <div>{activeCTF.type}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Desafíos</div>
                          <div>{activeCTF.challenges}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Participantes</div>
                          <div>{activeCTF.participants}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-cybersec-yellow">{activeCTF.name}</h3>
                          <Badge className={cn("border", getDifficultyColor(activeCTF.difficulty))}>
                            {activeCTF.difficulty}
                          </Badge>
                        </div>
                        <p className="text-gray-400 mb-4">{activeCTF.description}</p>
                        
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-300">
                            <Calendar className="h-4 w-4 mr-2 text-cybersec-yellow" />
                            <span>{formatDateRange(activeCTF.startDate, activeCTF.endDate)}</span>
                          </div>
                          <div className="flex items-center text-sm font-semibold text-cybersec-yellow">
                            <Timer className="h-4 w-4 mr-2" />
                            <span>{getTimeRemaining(activeCTF.endDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Tu progreso</span>
                            <span className="text-cybersec-yellow">
                              {activeCTF.userPoints} / {activeCTF.maxPoints} puntos
                            </span>
                          </div>
                          <Progress value={(activeCTF.userPoints / activeCTF.maxPoints) * 100} className="h-2" />
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
                              ? <span className="text-cybersec-neongreen">En progreso</span>
                              : <span className="text-cybersec-electricblue">Comienza en {Math.ceil((new Date(ctf.startDate) - new Date()) / (1000 * 60 * 60 * 24))} días</span>}
                          </div>
                          <Button 
                            className={ctf.registered 
                              ? "border-cybersec-neongreen text-cybersec-neongreen bg-transparent hover:bg-cybersec-neongreen/10"
                              : "bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80"}
                            variant={ctf.registered ? "outline" : "default"}
                          >
                            {ctf.registered ? 'Registrado' : 'Registrarse'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* CTFs pasados */}
              <TabsContent value="past">
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
                              {ctf.rank}/{ctf.totalParticipants}
                            </div>
                          </div>
                          <div className="bg-cybersec-black p-2 rounded">
                            <div className="text-xs text-gray-400 mb-0.5">Puntos</div>
                            <div className="font-semibold">{ctf.userPoints}/{ctf.maxPoints}</div>
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
              </TabsContent>
            </Tabs>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-cybersec-yellow" />
                    <CardTitle className="text-cybersec-yellow">Clasificación: {activeCTFs[0].name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {currentCTFLeaderboard.map((player) => (
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
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-cybersec-yellow text-cybersec-yellow"
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
                  <Button className="w-full bg-cybersec-electricblue text-cybersec-black hover:bg-cybersec-electricblue/80">
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
