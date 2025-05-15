
import { supabase } from '@/integrations/supabase/client';
import { CTF, LeaderboardEntry, CTFSession, CTFRegistration } from './types';
import { ActivityService } from '@/components/dashboard/ActivityService';

export const CTFService = {
  // Get active/upcoming CTFs
  getActiveCTFs: async (): Promise<CTF[]> => {
    try {
      console.log('Getting active CTFs...');
      
      // This is a placeholder for future API implementation
      // In a real implementation, this would fetch from Supabase
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

      return activeCTFsData;
    } catch (error) {
      console.error('Error fetching active CTFs:', error);
      return [];
    }
  },

  // Get past CTFs
  getPastCTFs: async (): Promise<CTF[]> => {
    // This is a placeholder for future API implementation
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

    return pastCTFsData;
  },

  // Get leaderboard data
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Map profiles to leaderboard entries
      return profiles.map((profile, index) => {
        // Create a display username that doesn't expose email addresses
        let displayName = profile.username || `Usuario`;
        
        // If it's an email, extract just the username part before @
        if (displayName.includes('@') && displayName.includes('.')) {
          displayName = displayName.split('@')[0];
        }
        
        return {
          rank: index + 1,
          name: displayName,
          points: profile.points || 0,
          solved: profile.solved_machines || 0,
          isCurrentUser: false // Will be set later for current user
        };
      });
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return [];
    }
  },

  // Check if user is registered for a CTF
  isUserRegisteredForCTF: async (userId: string, ctfId: number): Promise<boolean> => {
    try {
      console.log(`Checking if user ${userId} is registered for CTF ${ctfId}...`);
      
      // Use a direct query instead of RPC for checking registration status
      const { data, error } = await supabase
        .from('ctf_registrations')
        .select('id')
        .eq('user_id', userId)
        .eq('ctf_id', ctfId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking registration status:', error);
        return false;
      }

      // If data exists, user is registered
      const isRegistered = !!data;
      console.log('Registration status:', isRegistered);
      return isRegistered;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  },

  // Register user for CTF
  registerUserForCTF: async (userId: string, ctfId: number): Promise<{ success: boolean, registrationId?: string }> => {
    try {
      console.log(`Registering user ${userId} for CTF ${ctfId}...`);
      
      // Insert the registration directly
      const { data, error } = await supabase
        .from('ctf_registrations')
        .insert({
          user_id: userId,
          ctf_id: ctfId
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error registering for CTF:', error);
        throw error;
      }
      
      // Get the CTF details for activity logging
      let ctfName = '';
      const activeCTFs = await CTFService.getActiveCTFs();
      const ctf = activeCTFs.find(c => c.id === ctfId);
      if (ctf) {
        ctfName = ctf.name;
      }
      
      // Log the activity for the user using our centralized activity service
      const activityResult = await ActivityService.logActivity(
        userId, 
        'ctf_registration', 
        `Registro en CTF: ${ctfName}`, 
        10  // Award some points for registering
      );
      
      console.log(`User ${userId} registered for CTF ${ctfId}, reg ID: ${data.id}, activity logged: ${activityResult}`);
      
      return { success: true, registrationId: data.id };
    } catch (error) {
      console.error('Error registering for CTF:', error);
      return { success: false };
    }
  },

  // Get user's CTF registrations
  getUserCTFRegistrations: async (userId: string): Promise<CTFRegistration[]> => {
    try {
      console.log(`Getting registrations for user ${userId}...`);
      
      const { data, error } = await supabase
        .from('ctf_registrations')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user CTF registrations:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} registrations for user ${userId}`);
      return (data as CTFRegistration[]) || [];
    } catch (error) {
      console.error('Error fetching user CTF registrations:', error);
      return [];
    }
  }
};

export default CTFService;
