
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ChallengeCard, { Challenge } from '@/components/challenges/ChallengeCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Flag, Shield } from 'lucide-react';

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

// Mock data para desafíos activos
const activeChallenges: Challenge[] = [
  {
    id: "challenge1",
    title: "Linux Domination",
    description: "Resuelve 3 máquinas Linux para demostrar tus habilidades en entornos Unix.",
    category: "Máquinas",
    points: 500,
    startDate: "2023-05-10",
    endDate: "2023-05-24",
    participants: 348,
    isActive: true,
    isCompleted: false
  },
  {
    id: "challenge2",
    title: "Web Wizard",
    description: "Completa el curso de vulnerabilidades web y resuelve el laboratorio final.",
    category: "Educación",
    points: 300,
    startDate: "2023-05-15",
    endDate: "2023-05-22",
    participants: 215,
    isActive: true,
    isCompleted: true
  },
  {
    id: "challenge3",
    title: "King of Enumeration",
    description: "Demuestra tus habilidades de enumeración en esta competición especial.",
    category: "Competición",
    points: 750,
    startDate: "2023-05-17",
    endDate: "2023-05-31",
    participants: 187,
    isActive: true,
    isCompleted: false
  },
];

// Mock data para desafíos futuros
const upcomingChallenges: Challenge[] = [
  {
    id: "challenge4",
    title: "Active Directory Mastery",
    description: "Domina técnicas avanzadas de explotación en entornos de Active Directory.",
    category: "Windows",
    points: 800,
    startDate: "2023-05-25",
    endDate: "2023-06-10",
    participants: 124,
    isActive: false
  },
  {
    id: "challenge5",
    title: "CTF Summer Edition",
    description: "La competición de verano con múltiples categorías y grandes premios.",
    category: "CTF",
    points: 1500,
    startDate: "2023-06-01",
    endDate: "2023-06-15",
    participants: 543,
    isActive: false
  },
];

// Mock data para desafíos completados
const completedChallenges: Challenge[] = [
  {
    id: "challenge6",
    title: "Web Wizard",
    description: "Completaste el curso de vulnerabilidades web y resolviste el laboratorio final.",
    category: "Educación",
    points: 300,
    startDate: "2023-05-15",
    endDate: "2023-05-22",
    participants: 215,
    isActive: true,
    isCompleted: true
  },
  {
    id: "challenge7",
    title: "Buffer Overflow Basics",
    description: "Completaste con éxito los ejercicios de explotación de buffer overflows.",
    category: "Binary Exploitation",
    points: 400,
    startDate: "2023-04-20",
    endDate: "2023-05-05",
    participants: 168,
    isActive: false,
    isCompleted: true
  },
];

const Challenges = () => {
  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                Desafíos
              </h1>
              <p className="text-gray-400">
                Participa en desafíos semanales y especiales para ganar puntos extra e insignias
              </p>
            </header>

            {/* Resumen de desafíos */}
            <div className="mb-8">
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-cybersec-black rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-green-900/30 rounded-lg mr-3">
                          <Shield className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-green-400">Desafíos activos</h3>
                          <p className="text-gray-400 text-sm">Participando activamente</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {activeChallenges.filter(c => !c.isCompleted).length}
                      </div>
                    </div>
                    
                    <div className="bg-cybersec-black rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-cybersec-yellow/20 rounded-lg mr-3">
                          <Trophy className="h-5 w-5 text-cybersec-yellow" />
                        </div>
                        <div>
                          <h3 className="font-medium text-cybersec-yellow">Desafíos completados</h3>
                          <p className="text-gray-400 text-sm">Conquistas logradas</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {completedChallenges.length}
                      </div>
                    </div>
                    
                    <div className="bg-cybersec-black rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-cybersec-electricblue/20 rounded-lg mr-3">
                          <Flag className="h-5 w-5 text-cybersec-electricblue" />
                        </div>
                        <div>
                          <h3 className="font-medium text-cybersec-electricblue">Próximamente</h3>
                          <p className="text-gray-400 text-sm">Nuevos desafíos</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {upcomingChallenges.length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desafío principal */}
            <Card className="mb-8 neon-border-blue bg-cybersec-darkgray">
              <CardHeader className="pb-3">
                <CardTitle className="text-cybersec-electricblue flex items-center">
                  <Flag className="h-5 w-5 mr-2" />
                  Desafío Destacado de la Semana
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-cybersec-neongreen mb-2">Linux Domination</h3>
                      <p className="text-gray-300 mb-4">
                        Demuestra tu dominio sobre Linux resolviendo 3 máquinas en una semana.
                        Gana puntos extra por encontrar todas las flags de cada máquina.
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Finaliza en 5 días</span>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso</span>
                          <span>1/3 máquinas</span>
                        </div>
                        <Progress value={33} className="h-2" />
                      </div>
                      
                      <div className="flex items-center mb-6">
                        <Trophy className="h-5 w-5 text-cybersec-yellow mr-2" />
                        <span className="text-cybersec-yellow font-bold">500 pts al completar</span>
                      </div>
                      
                      <Button className="bg-cybersec-darkgray border border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-cybersec-black">
                        Continuar desafío
                      </Button>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 bg-cybersec-black p-5 rounded-lg">
                    <h4 className="font-medium text-cybersec-electricblue mb-3">Máquinas del desafío</h4>
                    
                    {/* Máquina 1 */}
                    <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg mb-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-400 mr-2" />
                          <span className="font-medium">VulnNet</span>
                        </div>
                        <Badge className="bg-green-900 text-green-400 border-green-700">Completada</Badge>
                      </div>
                    </div>
                    
                    {/* Máquina 2 */}
                    <div className="p-3 bg-cybersec-darkgray rounded-lg mb-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">CryptoLocker</span>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-cybersec-neongreen text-cybersec-neongreen">
                          Empezar
                        </Button>
                      </div>
                    </div>
                    
                    {/* Máquina 3 */}
                    <div className="p-3 bg-cybersec-darkgray rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">NetworkBreaker</span>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-cybersec-neongreen text-cybersec-neongreen">
                          Empezar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de desafíos */}
            <Tabs defaultValue="active">
              <TabsList className="bg-cybersec-darkgray mb-6">
                <TabsTrigger value="active" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Activos
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Próximos
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Completados
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="upcoming" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Challenges;
