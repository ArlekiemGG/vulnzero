
import { supabase } from '@/integrations/supabase/client';

export const TaskHintService = {
  // Complete a specific task in a machine
  completeTask: async (userId: string, machineId: string, taskId: number): Promise<void> => {
    // In a real implementation, this would update the database to mark the task as completed
    console.log(`Task ${taskId} completed by user ${userId} for machine ${machineId}`);
    // For demo purposes, we're not implementing the actual database update
  },

  // Get all hints for a machine, with locked status based on whether the user has unlocked them
  getHints: async (userId: string, machineId: string): Promise<any[]> => {
    try {
      // Get all hints for this machine
      const { data: machineHints, error: hintsError } = await supabase
        .from('machine_hints')
        .select('*')
        .eq('machine_id', machineId)
        .order('level');
      
      if (hintsError) throw hintsError;
      
      if (!machineHints || machineHints.length === 0) {
        return [];
      }
      
      // Get all hints this user has already unlocked for this machine
      const { data: unlockedHints, error: unlockedError } = await supabase
        .from('user_hints')
        .select('hint_level')
        .eq('user_id', userId)
        .eq('machine_id', machineId);
      
      if (unlockedError) throw unlockedError;
      
      const unlockedLevels = unlockedHints?.map(h => h.hint_level) || [];
      
      // Mark hints as locked/unlocked based on user's unlocked hints
      return machineHints.map(hint => ({
        id: hint.id,
        title: hint.title,
        content: hint.content,
        level: hint.level,
        pointCost: hint.point_cost,
        locked: !unlockedLevels.includes(hint.level)
      }));
    } catch (error) {
      console.error('Error getting machine hints:', error);
      return [];
    }
  },

  // Unlock a hint for a machine
  unlockHint: async (userId: string, machineId: string, hintLevel: number, pointCost: number): Promise<{success: boolean, error?: string}> => {
    try {
      // Start a transaction
      // 1. Get user's current points
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // 2. Check if user has enough points
      if (!userProfile || userProfile.points < pointCost) {
        return { 
          success: false,
          error: "No tienes suficientes puntos para desbloquear esta pista."
        };
      }
      
      // 3. Check if user has already unlocked this hint
      const { data: existingUnlock, error: checkError } = await supabase
        .from('user_hints')
        .select('id')
        .eq('user_id', userId)
        .eq('machine_id', machineId)
        .eq('hint_level', hintLevel)
        .single();
        
      if (checkError && !checkError.message.includes('No rows found')) throw checkError;
      
      if (existingUnlock) {
        return {
          success: false,
          error: "Ya has desbloqueado esta pista."
        };
      }
      
      // 4. Deduct points from user
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: userProfile.points - pointCost })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // 5. Record hint unlock
      const { error: unlockError } = await supabase
        .from('user_hints')
        .insert({
          user_id: userId,
          machine_id: machineId,
          hint_level: hintLevel,
          points_spent: pointCost
        });
      
      if (unlockError) throw unlockError;
      
      // 6. Log the activity of unlocking a hint
      await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_type: 'hint_unlocked',
        p_title: `Pista nivel ${hintLevel} para máquina ${machineId}`,
        p_points: -pointCost // Negative points for unlocking a hint
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

export default TaskHintService;
