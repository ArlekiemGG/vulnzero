import React, { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

// Import the refactored components
import CTFService from '@/components/ctf/CTFService';
import CTFTabs from '@/components/ctf/CTFTabs';
import CTFInfoCards from '@/components/ctf/CTFInfoCards';
import CTFSessionCard from '@/components/ctf/CTFSessionCard';
import { CTF, LeaderboardEntry, CTFSession, CTFRegistration } from '@/components/ctf/types';
import { CTFSessionSkeleton } from '@/components/ui/loading-skeleton';

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

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch CTFs data
      const [activeCTFsData, pastCTFsData, leaderboardData] = await Promise.all([
        CTFService.getActiveCTFs(),
        CTFService.getPastCTFs(),
        CTFService.getLeaderboard()
      ]);
      
      // If user is logged in, load their registrations and mark which CTFs they're registered for
      if (user) {
        console.log('User is logged in, checking registrations...');
        const userRegs = await loadUserRegistrations();
        
        // Mark which CTFs the user is registered for
        const updatedActiveCTFs = [...activeCTFsData];
        
        // Check each CTF individually with database to ensure accurate data
        for (let i = 0; i < updatedActiveCTFs.length; i++) {
          const ctf = updatedActiveCTFs[i];
          const isRegistered = await CTFService.isUserRegisteredForCTF(user.id, ctf.id);
          
          ctf.registered = isRegistered;
          
          // Find the registration if it exists
          const registration = userRegs.find(reg => reg.ctf_id === ctf.id);
          if (registration) {
            ctf.registrationId = registration.id;
          }
          
          console.log(`CTF ${ctf.id} (${ctf.name}) - Registered: ${isRegistered}`);
        }
        
        setActiveCTFs(updatedActiveCTFs);
      } else {
        setActiveCTFs(activeCTFsData);
      }
      
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

  useEffect(() => {
    loadData();
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
      console.log(`Registering for CTF ${ctfId}...`);
      const result = await CTFService.registerUserForCTF(user.id, ctfId);
      
      if (result.success) {
        // Update the local state
        setActiveCTFs(activeCTFs.map(ctf => 
          ctf.id === ctfId ? { ...ctf, registered: true, registrationId: result.registrationId } : ctf
        ));
        
        // Reload user registrations
        await loadUserRegistrations();
        
        // Refresh user stats to show updated points
        if (refreshUserStats) {
          await refreshUserStats();
        }
        
        toast({
          title: "Registro completado",
          description: "Te has registrado correctamente en el CTF.",
          variant: "default"
        });
        
        // Refrescar toda la información después de un registro exitoso
        setTimeout(() => {
          loadData();
        }, 1000);
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
            
            {/* CTF tabs component */}
            <CTFTabs 
              activeCTFs={activeCTFs}
              pastCTFs={pastCTFs}
              loading={loading}
              onRegister={handleRegisterCTF}
            />
            
            {/* Info cards */}
            <CTFInfoCards 
              leaderboard={leaderboard}
              loading={loading}
            />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CTFs;
