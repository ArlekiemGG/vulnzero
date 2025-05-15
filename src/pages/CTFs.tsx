
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

// Import the refactored components
import CTFService from '@/components/ctf/CTFService';
import CTFCard from '@/components/ctf/CTFCard';
import CTFLeaderboardCard from '@/components/ctf/CTFLeaderboardCard';
import CTFGuideCard from '@/components/ctf/CTFGuideCard';
import CTFSessionCard from '@/components/ctf/CTFSessionCard';
import { CTF, LeaderboardEntry, CTFSession, CTFRegistration } from '@/components/ctf/types';
import { CTFCardSkeleton, CTFSessionSkeleton } from '@/components/ui/loading-skeleton';

const CTFs = () => {
  const { user } = useAuth();
  const { userStats, refreshUserStats, loading: userLoading } = useUser();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCTFs, setActiveCTFs] = useState<CTF[]>([]);
  const [pastCTFs, setPastCTFs] = useState<CTF[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userActiveCTF, setUserActiveCTF] = useState<CTFSession | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<CTFRegistration[]>([]);

  // Load user registrations
  const loadUserRegistrations = async () => {
    if (!user) return [];
    try {
      console.log('Loading user registrations...');
      const registrations = await CTFService.getUserCTFRegistrations(user.id);
      console.log('User registrations loaded:', registrations);
      setUserRegistrations(registrations);
      return registrations;
    } catch (error) {
      console.error('Error loading user registrations:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch CTFs data
        const [activeCTFsData, pastCTFsData, leaderboardData] = await Promise.all([
          CTFService.getActiveCTFs(),
          CTFService.getPastCTFs(),
          CTFService.getLeaderboard()
        ]);
        
        // If user is logged in, load their registrations and mark which CTFs they're registered for
        let userRegs: CTFRegistration[] = [];
        if (user) {
          userRegs = await loadUserRegistrations();
          
          // Mark which CTFs the user is registered for
          for (const ctf of activeCTFsData) {
            const isRegistered = userRegs.some(reg => reg.ctf_id === ctf.id);
            ctf.registered = isRegistered;
            
            // Store the registration ID for reference
            const registration = userRegs.find(reg => reg.ctf_id === ctf.id);
            if (registration) {
              ctf.registrationId = registration.id;
            }
          }
        }
        
        setActiveCTFs(activeCTFsData);
        setPastCTFs(pastCTFsData);
        
        // Mark current user in leaderboard if present
        if (user) {
          const updatedLeaderboard = [...leaderboardData];
          
          // Find if current user is in the top 5
          const currentUserIndex = updatedLeaderboard.findIndex(
            entry => entry.name === localStorage.getItem('user_username')
          );
          
          if (currentUserIndex >= 0) {
            updatedLeaderboard[currentUserIndex].isCurrentUser = true;
          } else {
            // Add current user rank at the bottom if not in top 5
            try {
              const { data: userProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

              if (userProfile) {
                // Get user rank
                const { count: userRank } = await supabase
                  .from('profiles')
                  .select('*', { count: 'exact', head: true })
                  .gt('points', userProfile.points || 0);

                // Create a display username
                let displayName = userProfile.username || `Usuario`;
                
                if (displayName.includes('@') && displayName.includes('.')) {
                  displayName = displayName.split('@')[0];
                }

                updatedLeaderboard.push({
                  rank: (userRank || 0) + 1,
                  name: displayName,
                  points: userProfile.points || 0,
                  solved: userProfile.solved_machines || 0,
                  isCurrentUser: true
                });
              }
            } catch (error) {
              console.error("Error getting user rank:", error);
            }
          }
          
          setLeaderboard(updatedLeaderboard);
        } else {
          setLeaderboard(leaderboardData);
        }
        
        // For now we don't set any active CTF
        setUserActiveCTF(null);
      } catch (error) {
        console.error('Error fetching CTF data:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de los CTFs.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleRegisterCTF = async (ctfId: number) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para registrarte en un CTF.",
        variant: "default"
      });
      navigate('/auth');
      return;
    }

    try {
      const result = await CTFService.registerUserForCTF(user.id, ctfId);
      
      if (result.success) {
        // Update the local state
        setActiveCTFs(activeCTFs.map(ctf => 
          ctf.id === ctfId ? { ...ctf, registered: true, registrationId: result.registrationId } : ctf
        ));
        
        // Reload user registrations
        await loadUserRegistrations();
        
        // Refresh user stats to show updated points
        await refreshUserStats();
        
        toast({
          title: "Registro completado",
          description: "Te has registrado correctamente en el CTF.",
          variant: "default"
        });
      } else {
        throw new Error("No se pudo completar el registro");
      }
    } catch (error) {
      console.error("Error registering for CTF:", error);
      toast({
        title: "Error de registro",
        description: "No se pudo completar el registro en este momento.",
        variant: "destructive"
      });
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
              <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                Capture The Flag (CTF)
              </h1>
              <p className="text-gray-400">
                Demuestra tus habilidades en competiciones de ciberseguridad
              </p>
            </header>

            {/* CTF activo del usuario - solo se muestra si el usuario tiene uno activo */}
            {loading ? (
              <CTFSessionSkeleton />
            ) : (
              userActiveCTF && <CTFSessionCard session={userActiveCTF} />
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
                      <CTFCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {activeCTFs.map(ctf => (
                      <CTFCard 
                        key={ctf.id} 
                        ctf={ctf} 
                        onRegister={handleRegisterCTF} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* CTFs pasados */}
              <TabsContent value="past">
                {loading ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2, 3].map(i => (
                      <CTFCardSkeleton key={i} isPast={true} />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {pastCTFs.map(ctf => (
                      <CTFCard 
                        key={ctf.id} 
                        ctf={ctf}
                        isPast={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <CTFLeaderboardCard leaderboard={leaderboard} loading={loading} />
              <CTFGuideCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CTFs;
