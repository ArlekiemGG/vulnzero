import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import LeaderboardTable, { LeaderboardUser } from '@/components/leaderboard/LeaderboardTable';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';
import { supabase, queries } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Función optimizada para obtener el ranking desde Supabase
const fetchProfiles = async () => {
  try {
    console.log("Fetching profiles from Supabase...");
    const data = await queries.getLeaderboard();
    
    console.log("Successfully fetched profiles:", data);
    return data || [];
  } catch (err) {
    console.error("Exception fetching profiles:", err);
    throw new Error(`Error al cargar perfiles: ${(err as Error).message}`);
  }
};

// Función optimizada para obtener el perfil del usuario actual
const fetchCurrentUserProfile = async (userId: string | undefined) => {
  if (!userId) {
    console.log("No user ID provided, cannot fetch profile");
    return null;
  }
  
  try {
    console.log("Fetching current user profile with ID:", userId);
    
    const data = await queries.getUserProfile(userId);
    
    console.log("Successfully fetched user profile:", data);
    return data;
  } catch (err) {
    console.error("Exception fetching current user profile:", err);
    throw err;
  }
};

const Leaderboard = () => {
  const [selectedRegion, setSelectedRegion] = useState("global");
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const { user } = useAuth();
  
  // Consulta para obtener todos los perfiles
  const { 
    data: profiles = [], 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['leaderboard-profiles', selectedRegion],
    queryFn: fetchProfiles,
    retry: 2,
    refetchOnWindowFocus: false
  });
  
  // Obtener el perfil del usuario actual
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!user) return;
      
      try {
        const profile = await fetchCurrentUserProfile(user.id);
        setCurrentUserProfile(profile);
      } catch (err) {
        console.error("Error fetching current user profile:", err);
        toast({
          title: "Error al cargar perfil",
          description: "No se pudieron cargar tus datos de perfil.",
          variant: "destructive"
        });
      }
    };
    
    loadCurrentUser();
  }, [user]);
  
  // Error handling
  useEffect(() => {
    if (error) {
      toast({
        title: "Error al cargar el leaderboard",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  }, [error]);
  
  // Convertir perfiles de Supabase en formato LeaderboardUser y marcar el usuario actual
  useEffect(() => {
    if (profiles && profiles.length > 0) {
      const mappedUsers: LeaderboardUser[] = profiles.map((profile: any, index: number) => ({
        id: profile.id,
        rank: index + 1,
        username: profile.username || 'Usuario',
        avatar: profile.avatar_url,
        points: profile.points || 0,
        level: profile.level || 1,
        solvedMachines: profile.solved_machines || 0,
        rankChange: 'same',
        isCurrentUser: user ? profile.id === user.id : false
      }));
      
      setLeaderboardUsers(mappedUsers);
      console.log("Leaderboard users mapped:", mappedUsers);
      
      // Log del usuario actual para debugging
      if (user) {
        const currentUser = mappedUsers.find(u => u.isCurrentUser);
        console.log("Current user in leaderboard:", currentUser);
      }
    } else {
      setLeaderboardUsers([]);
    }
  }, [profiles, user]);
  
  // Función para scrollear a la posición del usuario
  const scrollToCurrentUser = () => {
    if (!user || !leaderboardUsers.length) {
      toast({
        title: "Usuario no encontrado",
        description: "No pudimos encontrar tu posición en el ranking actual",
        variant: "default"
      });
      return;
    }
    
    // Buscar si el usuario actual está en el leaderboard
    const currentUserRow = document.getElementById('current-user-row');
    if (currentUserRow) {
      currentUserRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      toast({
        title: "Usuario no encontrado",
        description: "No pudimos encontrar tu posición en el ranking actual",
        variant: "default"
      });
    }
  };
  
  // Obtenemos los top 3 para el showcase
  const top3Users = leaderboardUsers.slice(0, Math.min(3, leaderboardUsers.length));

  // Para propósitos de depuración
  console.log("Current profiles data:", profiles);
  console.log("Current user:", user);
  console.log("Current user profile:", currentUserProfile);
  console.log("Leaderboard users:", leaderboardUsers);
  console.log("Is there a current user row?", document.getElementById('current-user-row'));
  
  // Preparar datos para pestañas mensuales y semanales basados en los datos reales
  const monthlyLeaderboardUsers = leaderboardUsers.slice(0, Math.min(leaderboardUsers.length, 20));
  const weeklyLeaderboardUsers = leaderboardUsers.slice(0, Math.min(leaderboardUsers.length, 15));

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={currentUserProfile ? {
          level: currentUserProfile.level || 1,
          points: currentUserProfile.points || 0,
          pointsToNextLevel: 500, // Este valor debería calcularse según tu lógica de niveles
          progress: 0, // Esto también debería calcularse
          rank: leaderboardUsers.find(u => u.isCurrentUser)?.rank || 0,
          solvedMachines: currentUserProfile.solved_machines || 0,
          completedChallenges: currentUserProfile.completed_challenges || 0,
        } : {
          level: 1,
          points: 0,
          pointsToNextLevel: 500,
          progress: 0,
          rank: 0,
          solvedMachines: 0,
          completedChallenges: 0,
        }} />
        
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                  Leaderboard
                </h1>
                <p className="text-gray-400">
                  Compite con otros hackers por los primeros puestos
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[160px] bg-cybersec-darkgray border-cybersec-darkgray text-cybersec-neongreen">
                    <SelectValue placeholder="Seleccionar región" />
                  </SelectTrigger>
                  <SelectContent className="bg-cybersec-darkgray border-cybersec-darkgray">
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="europe">Europa</SelectItem>
                    <SelectItem value="america">América</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="oceania">Oceanía</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  className="border-cybersec-neongreen text-cybersec-neongreen"
                  onClick={scrollToCurrentUser}
                >
                  Mi posición
                </Button>
              </div>
            </header>

            <div className="mb-8">
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardHeader className="pb-3">
                  <CardTitle className="text-cybersec-neongreen">Top 3 Hackers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {top3Users.map((user, index) => (
                      <Card key={user.id} className={`bg-cybersec-black ${
                        index === 0 ? 'border-cybersec-yellow' : 
                        index === 1 ? 'border-gray-400' : 
                        'border-cybersec-red'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div className="mb-4">
                              <div className={`relative p-1 rounded-full ${
                                index === 0 ? 'bg-cybersec-yellow/20 border border-cybersec-yellow' : 
                                index === 1 ? 'bg-gray-500/20 border border-gray-400' : 
                                'bg-cybersec-red/20 border border-cybersec-red'
                              }`}>
                                <div className="w-20 h-20 rounded-full overflow-hidden">
                                  <img 
                                    src={user.avatar || "/placeholder.svg"}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0 ? 'bg-cybersec-yellow text-black' : 
                                  index === 1 ? 'bg-gray-400 text-black' : 
                                  'bg-cybersec-red text-black'
                                }`}>
                                  {index + 1}
                                </div>
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-1">{user.username}</h3>
                            
                            <div className={`mb-2 ${
                              index === 0 ? 'text-cybersec-yellow' : 
                              index === 1 ? 'text-gray-400' : 
                              'text-cybersec-red'
                            }`}>
                              <span className="font-mono font-bold">{user.points} pts</span>
                            </div>
                            
                            <div className="flex justify-center gap-3 text-sm text-gray-400">
                              <div className="flex items-center">
                                <Trophy className="h-3.5 w-3.5 mr-1.5 text-cybersec-electricblue" />
                                Nivel {user.level}
                              </div>
                              <div>{user.solvedMachines} máquinas</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="global">
              <TabsList className="bg-cybersec-darkgray mb-6">
                <TabsTrigger value="global" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Global
                </TabsTrigger>
                <TabsTrigger value="monthly" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Mensual
                </TabsTrigger>
                <TabsTrigger value="weekly" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Semanal
                </TabsTrigger>
              </TabsList>

              <TabsContent value="global">
                <LeaderboardTable 
                  users={leaderboardUsers} 
                  currentPeriod="Global" 
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="monthly">
                <LeaderboardTable 
                  users={monthlyLeaderboardUsers} 
                  currentPeriod={`${new Date().toLocaleString('es', { month: 'long' })} ${new Date().getFullYear()}`} 
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="weekly">
                <LeaderboardTable 
                  users={weeklyLeaderboardUsers}
                  currentPeriod={`Semana ${Math.ceil(new Date().getDate() / 7)} - ${new Date().toLocaleString('es', { month: 'long' })}`} 
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;
