
import { supabase } from '@/integrations/supabase/client';
import { machines } from '../MachineData';

export const FlagService = {
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
  }
};

export default FlagService;
