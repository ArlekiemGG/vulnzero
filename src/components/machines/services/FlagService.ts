
import { supabase } from '@/integrations/supabase/client';

const FLAG_API_URL = window.location.hostname.includes("localhost") 
  ? "http://localhost:5000/api"  // Local development
  : "https://api.vulnzero.es/api"; // Production

interface FlagValidationResponse {
  success: boolean;
  points?: number;
  message?: string;
  error?: string;
}

export const FlagService = {
  // Submit a flag for a machine
  submitFlag: async (userId: string, machineId: string, flag: string, flagType: 'user' | 'root'): Promise<{ success: boolean; message: string; points?: number }> => {
    try {
      // Call real backend API to validate flag
      const response = await fetch(`${FLAG_API_URL}/flags/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machine: machineId,
          flag: flag,
          level: flagType,
          userId: userId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Flag validation API error:', errorText);
        return { 
          success: false, 
          message: 'Error al validar la flag. Por favor, inténtalo de nuevo.' 
        };
      }

      const data: FlagValidationResponse = await response.json();
      
      if (!data.success) {
        return { 
          success: false, 
          message: data.error || 'Flag incorrecta. Inténtalo de nuevo.' 
        };
      }
      
      // Check if user has already submitted this flag
      const { data: progressData, error } = await supabase
        .from('user_machine_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('machine_id', machineId)
        .single();
      
      // Flag message for display
      const flagMessage = flagType === 'user' ? 'user.txt' : 'root.txt';
      
      if (progressData && !error) {
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
        p_points: data.points || (flagType === 'user' ? 20 : 50)
      });
      
      return { 
        success: true, 
        message: `¡Flag correcta! Has capturado ${flagMessage}`, 
        points: data.points || (flagType === 'user' ? 20 : 50)
      };
    } catch (error) {
      console.error('Error submitting flag:', error);
      return { success: false, message: 'Error al procesar la flag. Inténtalo más tarde.' };
    }
  }
};

export default FlagService;
