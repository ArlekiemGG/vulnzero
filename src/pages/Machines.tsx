import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MachineCard from '@/components/machines/MachineCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, queries } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MachineService } from '@/components/machines/MachineService';
import { MachineProps } from '@/components/machines/MachineCard';
import { machines } from '@/components/machines/MachineData';

const Machines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOS, setSelectedOS] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
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
  
  const [machinesWithProgress, setMachinesWithProgress] = useState(machines);
  const [activeSessions, setActiveSessions] = useState<string[]>([]);
  
  // Fetch user profile data and active sessions
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const profileData = await queries.getUserProfile(user.id);
          
        if (profileData) {
          console.log("Profile data loaded in Machines:", profileData);
          
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

          // Get user active sessions
          try {
            const { data: sessions } = await supabase
              .from('machine_sessions')
              .select('machine_type_id')
              .eq('user_id', user.id)
              .neq('status', 'terminated');
              
            if (sessions) {
              const activeSessionMachineIds = sessions.map(session => session.machine_type_id);
              setActiveSessions(activeSessionMachineIds);
            }
          } catch (error) {
            console.error('Error fetching active sessions:', error);
          }

          // Update machine progress for the user
          const updatedMachines = [...machines];
          
          // Get machine progress for each machine (in a real app, this would be a single API call)
          for (let i = 0; i < updatedMachines.length; i++) {
            try {
              const machineProgress = await MachineService.getUserMachineProgress(
                user.id,
                updatedMachines[i].id
              );
              updatedMachines[i].userProgress = machineProgress.progress;
            } catch (error) {
              console.error(`Error fetching progress for machine ${updatedMachines[i].id}:`, error);
            }
          }
          
          setMachinesWithProgress(updatedMachines);
        } else {
          console.error('No profile data returned');
          toast({
            title: "Error al cargar perfil",
            description: "No se pudieron cargar tus datos de perfil.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading profile in Machines:', error);
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
  
  // Filtro de máquinas
  const filteredMachines = machinesWithProgress.map(machine => ({
    ...machine,
    hasActiveSession: activeSessions.includes(machine.id)
  })).filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          machine.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          machine.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesOS = selectedOS === 'all' || machine.osType === selectedOS;
    const matchesDifficulty = selectedDifficulty === 'all' || machine.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesOS && matchesDifficulty;
  });

  const getCompletedMachines = () => filteredMachines.filter(m => m.userProgress === 100);
  const getInProgressMachines = () => filteredMachines.filter(m => (m.userProgress > 0 && m.userProgress < 100) || m.hasActiveSession);
  const getPendingMachines = () => filteredMachines.filter(m => m.userProgress === 0 && !m.hasActiveSession);

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                Máquinas Vulnerables
              </h1>
              <p className="text-gray-400">
                Explora y resuelve máquinas vulnerables para mejorar tus habilidades
              </p>
            </header>

            {/* Filtros */}
            <div className="bg-cybersec-darkgray p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Buscar por nombre, descripción o categoría..." 
                    className="bg-cybersec-black pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-3">
                  <Select value={selectedOS} onValueChange={setSelectedOS}>
                    <SelectTrigger className="bg-cybersec-black">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Sistema Operativo" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-cybersec-darkgray border-cybersec-darkgray">
                      <SelectItem value="all">Todos los sistemas</SelectItem>
                      <SelectItem value="linux">Linux</SelectItem>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="other">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-3">
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="bg-cybersec-black">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Dificultad" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-cybersec-darkgray border-cybersec-darkgray">
                      <SelectItem value="all">Todas las dificultades</SelectItem>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                      <SelectItem value="insane">Insano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-1">
                  <Button 
                    variant="outline" 
                    className="w-full border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-cybersec-black"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedOS('all');
                      setSelectedDifficulty('all');
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline" className="bg-transparent border-cybersec-electricblue text-cybersec-electricblue">
                  Linux: {machines.filter(m => m.osType === 'linux').length}
                </Badge>
                <Badge variant="outline" className="bg-transparent border-cybersec-electricblue text-cybersec-electricblue">
                  Windows: {machines.filter(m => m.osType === 'windows').length}
                </Badge>
                <Badge variant="outline" className="bg-transparent border-green-500 text-green-500">
                  Fácil: {machines.filter(m => m.difficulty === 'easy').length}
                </Badge>
                <Badge variant="outline" className="bg-transparent border-yellow-500 text-yellow-500">
                  Media: {machines.filter(m => m.difficulty === 'medium').length}
                </Badge>
                <Badge variant="outline" className="bg-transparent border-red-500 text-red-500">
                  Difícil: {machines.filter(m => m.difficulty === 'hard').length}
                </Badge>
                <Badge variant="outline" className="bg-transparent border-purple-500 text-purple-500">
                  Insano: {machines.filter(m => m.difficulty === 'insane').length}
                </Badge>
              </div>
            </div>

            {/* Máquinas */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-cybersec-darkgray mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Todas ({filteredMachines.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Completadas ({getCompletedMachines().length})
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  En Progreso ({getInProgressMachines().length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Pendientes ({getPendingMachines().length})
                </TabsTrigger>
              </TabsList>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-lg bg-cybersec-darkgray h-80 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <>
                  <TabsContent value="all" className="mt-0">
                    {filteredMachines.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMachines.map((machine) => (
                          <MachineCard key={machine.id} {...machine} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-cybersec-darkgray rounded-lg">
                        <p className="text-gray-400">No se encontraron máquinas con los filtros seleccionados</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="mt-0">
                    {getCompletedMachines().length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {getCompletedMachines().map((machine) => (
                          <MachineCard key={machine.id} {...machine} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-cybersec-darkgray rounded-lg">
                        <p className="text-gray-400">No has completado ninguna máquina con los filtros seleccionados</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="in_progress" className="mt-0">
                    {getInProgressMachines().length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {getInProgressMachines().map((machine) => (
                          <MachineCard key={machine.id} {...machine} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-cybersec-darkgray rounded-lg">
                        <p className="text-gray-400">No tienes máquinas en progreso con los filtros seleccionados</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="mt-0">
                    {getPendingMachines().length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {getPendingMachines().map((machine) => (
                          <MachineCard key={machine.id} {...machine} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-cybersec-darkgray rounded-lg">
                        <p className="text-gray-400">No tienes máquinas pendientes con los filtros seleccionados</p>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Machines;
