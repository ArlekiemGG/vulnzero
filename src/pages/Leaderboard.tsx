import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import LeaderboardTable, { LeaderboardUser } from '@/components/leaderboard/LeaderboardTable';
import { 
  fetchLeaderboardData, 
  getCurrentUserLeaderboardPosition 
} from '@/components/leaderboard/LeaderboardService';
import { queries } from '@/integrations/supabase/client';
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
import { Trophy, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Leaderboard = () => {
  const [selectedRegion, setSelectedRegion] = useState("global");
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const { user } = useAuth();
  
  // Query to fetch leaderboard data
  const { 
    data: profiles = [], 
    isLoading,
    error,
    refetch,
    isError,
    isRefetching
  } = useQuery({
    queryKey: ['leaderboard-profiles', selectedRegion],
    queryFn: () => fetchLeaderboardData(),
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 60000
  });
  
  // Load current user profile
  useEffect(() => {
    if (!user) return;
    
    const loadUserProfile = async () => {
      try {
        const profile = await queries.getUserProfile(user.id);
        if (profile) {
          setCurrentUserProfile(profile);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };
    
    loadUserProfile();
  }, [user]);
  
  // Transform profiles to leaderboard format
  useEffect(() => {
    if (!profiles) {
      setLeaderboardUsers([]);
      return;
    }
    
    const mappedUsers = Array.isArray(profiles) ? profiles.map((profile: LeaderboardUser, index: number) => {
      // Create a display username that doesn't expose email addresses
      let displayName = profile.username || 'Usuario';
      
      // If it's an email, extract just the username part before @
      if (displayName.includes('@') && displayName.includes('.')) {
        displayName = displayName.split('@')[0];
      }
      
      return {
        ...profile,
        username: displayName,
        rank: index + 1,
        isCurrentUser: user ? profile.id === user.id : false
      };
    }) : [];
    
    setLeaderboardUsers(mappedUsers);
  }, [profiles, user]);
  
  // Function to scroll to user position
  const scrollToCurrentUser = () => {
    if (!user) {
      toast({
        title: "Usuario no encontrado",
        description: "Debes iniciar sesión para ver tu posición",
      });
      return;
    }
    
    const currentUserRow = document.getElementById('current-user-row');
    if (currentUserRow) {
      currentUserRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight row for better visibility
      currentUserRow.classList.add('bg-cybersec-neongreen/20');
      setTimeout(() => {
        currentUserRow.classList.remove('bg-cybersec-neongreen/20');
      }, 2000);
    } else {
      toast({
        title: "Usuario no encontrado",
        description: "No pudimos encontrar tu posición en el ranking actual",
      });
    }
  };
  
  // Function to manually refresh data
  const handleRefresh = async () => {
    try {
      await refetch();
      
      toast({
        title: "Datos actualizados",
        description: "Los datos del leaderboard han sido actualizados",
      });
    } catch (err) {
      console.error("Error refreshing leaderboard:", err);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos",
        variant: "destructive"
      });
    }
  };
  
  // Get top 3 users for showcase
  const top3Users = leaderboardUsers.slice(0, Math.min(3, leaderboardUsers.length));
  
  // Prepare data for monthly and weekly tabs
  // For a real implementation, these would be fetched separately
  const monthlyLeaderboardUsers = leaderboardUsers.slice(0, Math.min(leaderboardUsers.length, 20));
  const weeklyLeaderboardUsers = leaderboardUsers.slice(0, Math.min(leaderboardUsers.length, 15));
  
  // Calculate user stats for sidebar
  const userStats = currentUserProfile ? {
    level: currentUserProfile.level || 1,
    points: currentUserProfile.points || 0,
    pointsToNextLevel: 500, // This should be calculated based on level logic
    progress: currentUserProfile.points ? (currentUserProfile.points % 500) / 5 : 0,
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
  };

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        
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
                <Button
                  variant="outline"
                  className="border-cybersec-electricblue text-cybersec-electricblue flex items-center gap-2"
                  onClick={handleRefresh}
                  disabled={isRefetching}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                  {isRefetching ? 'Actualizando...' : 'Actualizar datos'}
                </Button>
              </div>
            </header>

            {isError && (
              <Alert className="mb-4 bg-amber-900/20 border-amber-900">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Problemas técnicos</AlertTitle>
                <AlertDescription>
                  Estamos experimentando problemas para cargar el leaderboard. 
                  <Button 
                    variant="link" 
                    className="text-cybersec-electricblue p-0 h-auto font-normal ml-2"
                    onClick={handleRefresh}
                  >
                    Intentar de nuevo
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="mb-8">
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardHeader className="pb-3">
                  <CardTitle className="text-cybersec-neongreen">Top 3 Hackers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {top3Users.length > 0 ? (
                      top3Users.map((user, index) => (
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
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                      }}
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
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-8 text-gray-400">
                        {isLoading ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cybersec-neongreen mb-4"></div>
                            <p>Cargando los mejores hackers...</p>
                          </div>
                        ) : (
                          <div>
                            <p className="mb-4">No hay datos disponibles en el leaderboard</p>
                            <Button 
                              variant="outline" 
                              className="border-cybersec-neongreen text-cybersec-neongreen"
                              onClick={handleRefresh}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Intentar cargar de nuevo
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
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
                  isLoading={isLoading || isRefetching}
                />
              </TabsContent>
              
              <TabsContent value="monthly">
                <LeaderboardTable 
                  users={monthlyLeaderboardUsers} 
                  currentPeriod={`${new Date().toLocaleString('es', { month: 'long' })} ${new Date().getFullYear()}`} 
                  isLoading={isLoading || isRefetching}
                />
              </TabsContent>
              
              <TabsContent value="weekly">
                <LeaderboardTable 
                  users={weeklyLeaderboardUsers}
                  currentPeriod={`Semana ${Math.ceil(new Date().getDate() / 7)} - ${new Date().toLocaleString('es', { month: 'long' })}`} 
                  isLoading={isLoading || isRefetching}
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
