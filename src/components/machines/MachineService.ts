
import { machines } from './MachineData';
import { supabase } from '@/integrations/supabase/client';

// Interface for machine progress information
export interface MachineProgress {
  machineId: string;
  userId: string;
  progress: number;
  flags: string[];
  startedAt?: string;
  lastActivityAt?: string;
  completedAt?: string;
}

// Interface for extended machine details
export interface MachineDetails {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  categories: string[];
  points: number;
  solvedBy: number;
  userProgress: number;
  image: string;
  osType: 'linux' | 'windows' | 'other';
  featured?: boolean;
  ipAddress?: string;
  creator?: string;
  releaseDate?: string;
  requirements?: string[];
  skills?: string[];
  tasks?: Array<{
    id: number;
    name: string;
    description: string;
    completed: boolean;
  }>;
  hints?: Array<{
    id: number;
    title: string;
    content: string;
    locked: boolean;
  }>;
}

export const MachineService = {
  // Get all available machines
  getAllMachines: () => {
    return machines;
  },

  // Get a specific machine by ID
  getMachine: (id: string): MachineDetails => {
    const machine = machines.find(machine => machine.id === id);
    
    if (!machine) {
      throw new Error(`Machine with ID ${id} not found`);
    }
    
    // Add additional details that might be needed for the machine detail page
    return {
      ...machine,
      solvedBy: machine.solvedBy || 0, // Ensure solvedBy has a default value
      ipAddress: '10.10.10.' + Math.floor(Math.random() * 254 + 1),
      creator: 'VulnZero Team',
      releaseDate: '2025-01-15',
      requirements: [
        'Conexión VPN activa',
        'Kali Linux o similar',
        'Conocimientos básicos de enumeración'
      ],
      skills: [
        'Enumeración de servicios',
        'Explotación de vulnerabilidades web',
        'Escalada de privilegios en Linux'
      ],
      tasks: [
        { id: 1, name: 'Enumerar servicios', description: 'Identifica los servicios disponibles en la máquina', completed: false },
        { id: 2, name: 'Conseguir shell', description: 'Obtén acceso al sistema mediante una shell', completed: false },
        { id: 3, name: 'Capturar flag de usuario', description: 'Encuentra y envía la flag de usuario', completed: false },
        { id: 4, name: 'Escalar privilegios', description: 'Eleva tus privilegios a root/administrador', completed: false },
        { id: 5, name: 'Capturar flag de root', description: 'Encuentra y envía la flag de root', completed: false }
      ],
      hints: [
        { id: 1, title: 'Pista de enumeración', content: 'Busca servicios HTTP y SSH. Revisa cuidadosamente las versiones.', locked: true },
        { id: 2, title: 'Pista de acceso inicial', content: 'El servidor web tiene un directorio oculto con un panel de admin mal configurado.', locked: true },
        { id: 3, title: 'Pista de escalada', content: 'Hay un archivo SUID configurado incorrectamente que puede ser explotado.', locked: true }
      ]
    };
  },

  // Get user progress for a specific machine
  getUserMachineProgress: async (userId: string, machineId: string): Promise<MachineProgress> => {
    try {
      // Check if the user has completed this machine
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'machine_completed')
        .eq('title', machines.find(m => m.id === machineId)?.name || '');
      
      // If there are activities, the machine has been completed
      if (activities && activities.length > 0) {
        return {
          machineId,
          userId,
          progress: 100,
          flags: ['root.txt', 'user.txt'],
          startedAt: activities[0].created_at,
          completedAt: activities[0].created_at
        };
      }
      
      // Check if there is an active session
      const { data: sessions } = await supabase
        .from('machine_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('machine_type_id', machineId)
        .neq('status', 'terminated');
      
      // If there is an active session, return progress based on time spent
      if (sessions && sessions.length > 0) {
        const session = sessions[0];
        const startTime = new Date(session.started_at).getTime();
        const currentTime = Date.now();
        const totalTime = new Date(session.expires_at).getTime() - startTime;
        const timeSpent = currentTime - startTime;
        
        // Calculate progress as a percentage of time spent (max 80% unless flags are captured)
        const progressByTime = Math.min(80, Math.round((timeSpent / totalTime) * 100));
        
        return {
          machineId,
          userId,
          progress: progressByTime,
          flags: [],
          startedAt: session.started_at,
          lastActivityAt: new Date().toISOString()
        };
      }
      
      // Default: no progress
      return {
        machineId,
        userId,
        progress: 0,
        flags: []
      };
    } catch (error) {
      console.error('Error getting machine progress:', error);
      return {
        machineId,
        userId,
        progress: 0,
        flags: []
      };
    }
  },

  // Submit a flag for a machine
  submitFlag: async (userId: string, machineId: string, flag: string, flagType: 'user' | 'root' = 'user'): Promise<{success: boolean, message: string, points?: number}> => {
    try {
      // Simulate verification based on flag type
      const isUserFlag = flag === "flag{user_owned}";
      const isRootFlag = flag === "flag{root_owned}";
      const isCorrectFlag = (flagType === 'user' && isUserFlag) || (flagType === 'root' && isRootFlag);
      
      if (isCorrectFlag) {
        // Calculate points based on flag type
        const pointsToAdd = flagType === 'user' ? 10 : 20;
        const machine = machines.find(m => m.id === machineId);
        
        // Add user activity
        const { error } = await supabase.rpc('log_user_activity', {
          p_user_id: userId,
          p_type: flagType === 'root' ? 'machine_completed' : 'flag_captured',
          p_title: machine?.name || 'Unknown Machine',
          p_points: pointsToAdd
        });
        
        if (error) {
          console.error('Error logging activity:', error);
        }
        
        // If it's the root flag, increment the user's solved machines count
        if (flagType === 'root') {
          try {
            // Get the current profile data
            const { data: profile } = await supabase
              .from('profiles')
              .select('solved_machines')
              .eq('id', userId)
              .single();
            
            if (profile) {
              // Update with incremented value
              await supabase
                .from('profiles')
                .update({ 
                  solved_machines: (profile.solved_machines || 0) + 1 
                })
                .eq('id', userId);
            }
          } catch (err) {
            console.error('Error updating solved machines count:', err);
          }
        }
        
        return {
          success: true,
          message: `¡Flag correcto! Has ${flagType === 'root' ? 'completado la máquina' : 'avanzado en esta máquina'}.`,
          points: pointsToAdd
        };
      }
      
      return {
        success: false,
        message: "Flag incorrecto, inténtalo de nuevo."
      };
    } catch (error) {
      console.error('Error submitting flag:', error);
      return {
        success: false,
        message: "Error al procesar el flag. Inténtalo de nuevo más tarde."
      };
    }
  },

  // Complete a specific task in a machine
  completeTask: async (userId: string, machineId: string, taskId: number): Promise<void> => {
    // In a real implementation, this would update the database to mark the task as completed
    console.log(`Task ${taskId} completed by user ${userId} for machine ${machineId}`);
    // For demo purposes, we're not implementing the actual database update
  },
  
  // Log activity related to machine usage
  logMachineActivity: async (userId: string, machineId: string, activityType: string, points: number = 0): Promise<void> => {
    try {
      const machine = machines.find(m => m.id === machineId);
      
      await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_type: activityType,
        p_title: machine?.name || 'Unknown Machine',
        p_points: points
      });
    } catch (error) {
      console.error('Error logging machine activity:', error);
    }
  },
  
  // Unlock a hint for a machine
  unlockHint: async (userId: string, machineId: string, hintId: number): Promise<{success: boolean, error?: string}> => {
    try {
      // In a real implementation, this would check if the user has enough points,
      // deduct points, and unlock the hint in the database
      
      // Log the activity of unlocking a hint
      await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_type: 'hint_unlocked',
        p_title: `Hint #${hintId} for machine ${machineId}`,
        p_points: -50 // Deduct points for unlocking a hint
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error unlocking hint:', error);
      return { 
        success: false,
        error: "Error al desbloquear la pista. Inténtalo de nuevo más tarde."
      };
    }
  }
};

export default MachineService;
