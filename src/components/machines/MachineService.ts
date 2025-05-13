
import { machines } from './MachineData';
import { supabase } from '@/integrations/supabase/client';

// Interface for machine progress information
interface MachineProgress {
  machineId: string;
  userId: string;
  progress: number;
  flags: string[];
  startedAt?: string;
  lastActivityAt?: string;
  completedAt?: string;
}

export const MachineService = {
  // Get all available machines
  getAllMachines: () => {
    return machines;
  },

  // Get a specific machine by ID
  getMachine: (id: string) => {
    return machines.find(machine => machine.id === id);
  },

  // Get user progress for a specific machine
  getUserMachineProgress: async (userId: string, machineId: string): Promise<MachineProgress> => {
    // Aquí puedes implementar la lógica para obtener el progreso del usuario en una máquina específica
    // Por ahora, devolvamos datos de prueba
    
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
  submitFlag: async (userId: string, machineId: string, flag: string): Promise<{success: boolean, message: string}> => {
    // Esta función verificaría si el flag enviado es correcto
    // Por ahora, vamos a simular el comportamiento
    
    try {
      // Simulate verification (in a real implementation, you would validate against the correct flag)
      const isCorrectFlag = flag === "flag{user_owned}" || flag === "flag{root_owned}";
      
      if (isCorrectFlag) {
        // Update progress in the database
        // In a real implementation, you'd update machine progress and possibly add an activity
        
        // If it's the final flag, mark the machine as completed
        if (flag === "flag{root_owned}") {
          const machine = machines.find(m => m.id === machineId);
          
          await supabase.from('user_activities').insert({
            user_id: userId,
            type: 'machine_completed',
            title: machine?.name || 'Unknown Machine',
            points: machine?.points || 10
          });
          
          // Update user's solved machines count
          await supabase.rpc('increment_solved_machines', { user_id: userId });
        }
        
        return {
          success: true,
          message: "¡Flag correcto! Has avanzado en esta máquina."
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
  }
};

// Implementación para mostrar efectos de demo
export default MachineService;
