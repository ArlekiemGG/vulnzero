
import { supabase } from '@/integrations/supabase/client';

export const FlagService = {
  // Submit a flag for a machine
  submitFlag: async (userId: string, machineId: string, flag: string, flagType: 'user' | 'root'): Promise<{ success: boolean; message: string; points?: number }> => {
    try {
      // Machine flags validation - In a real app, these would be stored in the database and validated against
      const expectedFlags: Record<string, Record<string, string>> = {
        '01': {
          user: 'flag{th1s_1s_us3r_fl4g}',
          root: 'flag{r00t_pwn3d_m4ch1n3}'
        },
        '02': {
          user: 'flag{b4s1c_us3r_4cc3ss}',
          root: 'flag{r00t_sh3ll_g41n3d}'
        },
        // Add more machines as needed
      };
      
      // Get the expected flag for this machine and flag type
      const expectedFlag = expectedFlags[machineId]?.[flagType];
      if (!expectedFlag) {
        return { success: false, message: 'Flag not available for this machine.' };
      }
      
      // Check if flag is correct
      const isCorrect = flag.trim() === expectedFlag;
      if (!isCorrect) {
        return { success: false, message: 'Flag incorrecta. Inténtalo de nuevo.' };
      }
      
      // Check if user has already submitted this flag
      const { data: progressData } = await supabase
        .from('user_machine_progress')
        .select('flags, progress')
        .eq('user_id', userId)
        .eq('machine_id', machineId)
        .single();
      
      // Points for flags
      const pointsForFlag = flagType === 'user' ? 50 : 100;
      const flagMessage = flagType === 'user' ? 'user.txt' : 'root.txt';
      
      if (progressData) {
        const existingFlags = progressData.flags || [];
        
        // Check if flag was already submitted
        if (existingFlags.includes(flagMessage)) {
          return { success: true, message: 'Flag ya enviada anteriormente' };
        }
        
        // Add new flag and update progress
        const updatedFlags = [...existingFlags, flagMessage];
        let newProgress = progressData.progress;
        
        // Update progress based on flag type
        if (flagType === 'user') {
          newProgress = Math.max(newProgress, 50); // User flag captures gives 50% progress
        } else if (flagType === 'root') {
          newProgress = 100; // Root flag means machine is completed
        }
        
        // Update progress in database
        await supabase
          .from('user_machine_progress')
          .update({
            flags: updatedFlags,
            progress: newProgress,
            last_activity_at: new Date().toISOString(),
            completed_at: flagType === 'root' ? new Date().toISOString() : progressData.completed_at
          })
          .eq('user_id', userId)
          .eq('machine_id', machineId);
      } else {
        // Create new progress entry with the flag
        const newFlags = [flagMessage];
        const newProgress = flagType === 'user' ? 50 : 100;
        
        await supabase
          .from('user_machine_progress')
          .insert({
            user_id: userId,
            machine_id: machineId,
            flags: newFlags,
            progress: newProgress,
            started_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
            completed_at: flagType === 'root' ? new Date().toISOString() : null
          });
      }
      
      // Log activity and award points
      await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_type: 'flag_captured',
        p_title: `Flag ${flagType} capturada en máquina ${machineId}`,
        p_points: pointsForFlag
      });
      
      return { 
        success: true, 
        message: `¡Flag correcta! Has capturado ${flagMessage}`, 
        points: pointsForFlag 
      };
    } catch (error) {
      console.error('Error submitting flag:', error);
      return { success: false, message: 'Error al procesar la flag. Inténtalo más tarde.' };
    }
  }
};

export default FlagService;
