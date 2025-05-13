
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Update the MachineHint interface to use the correct id type
export interface MachineHint {
  id: number;
  title: string;
  content: string;
  level: number;
  pointCost: number;
  locked: boolean;
}

export const TaskHintService = {
  // Complete a specific task in a machine
  completeTask: async (userId: string, machineId: string, taskId: number): Promise<boolean> => {
    try {
      // Log the task completion as an activity
      await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_type: 'task_completed',
        p_title: `Task ${taskId} completed on machine ${machineId}`,
        p_points: 10 // Puntos por completar una tarea
      });
      
      // Update the user's machine progress to reflect completed tasks
      const { data: progressData, error } = await supabase
        .from('user_machine_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('machine_id', machineId)
        .single();
      
      if (progressData && !error) {
        let completedTasks = progressData.completed_tasks || [];
        if (!completedTasks.includes(taskId)) {
          completedTasks.push(taskId);
        }
        
        // Calculate new progress based on completed tasks
        let newProgress = progressData.progress;
        if (taskId === 1) newProgress = Math.max(newProgress, 20);
        else if (taskId === 2) newProgress = Math.max(newProgress, 40);
        else if (taskId === 3) newProgress = Math.max(newProgress, 60);
        else if (taskId === 4) newProgress = Math.max(newProgress, 80);
        else if (taskId === 5) newProgress = Math.max(newProgress, 100);
        
        await supabase
          .from('user_machine_progress')
          .update({
            progress: newProgress,
            completed_tasks: completedTasks,
            last_activity_at: new Date().toISOString(),
            completed_at: newProgress >= 100 ? new Date().toISOString() : null
          })
          .eq('user_id', userId)
          .eq('machine_id', machineId);
      } else {
        // Create new progress entry if doesn't exist
        let completedTasks = [taskId];
        let newProgress = 0;
        if (taskId === 1) newProgress = 20;
        else if (taskId === 2) newProgress = 40;
        else if (taskId === 3) newProgress = 60;
        else if (taskId === 4) newProgress = 80;
        else if (taskId === 5) newProgress = 100;
        
        await supabase
          .from('user_machine_progress')
          .insert({
            user_id: userId,
            machine_id: machineId,
            progress: newProgress,
            completed_tasks: completedTasks,
            started_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
            completed_at: newProgress >= 100 ? new Date().toISOString() : null
          });
      }
      
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  },

  // Get all hints for a specific machine for a user
  getHints: async (userId: string, machineId: string): Promise<MachineHint[]> => {
    try {
      // Get all machine hints
      const { data: machineHints, error: hintsError } = await supabase
        .from('machine_hints')
        .select('*')
        .eq('machine_id', machineId)
        .order('level');
      
      if (hintsError || !machineHints) {
        throw hintsError || new Error('No se encontraron pistas para esta máquina');
      }
      
      // Get user's unlocked hints
      const { data: userHints, error: userHintsError } = await supabase
        .from('user_hints')
        .select('*')
        .eq('user_id', userId)
        .eq('machine_id', machineId);
      
      if (userHintsError) {
        console.error('Error al obtener las pistas desbloqueadas del usuario:', userHintsError);
      }
      
      // Convert to the expected MachineHint format and ensure proper type conversion
      const hints: MachineHint[] = machineHints.map(hint => {
        const isUnlocked = userHints?.some(uh => uh.hint_level === hint.level) || false;
        
        return {
          id: Number(hint.id), // Convert the ID to number to match the interface
          title: hint.title,
          content: hint.content,
          level: hint.level,
          pointCost: hint.point_cost,
          locked: !isUnlocked
        };
      });
      
      return hints;
    } catch (error) {
      console.error('Error al obtener las pistas:', error);
      
      // Return default hints if there's an error (fallback)
      return [
        {
          id: 1,
          title: "Pista de enumeración",
          content: "Busca servicios HTTP y SSH. Revisa cuidadosamente las versiones.",
          level: 1,
          pointCost: 50,
          locked: true
        },
        {
          id: 2,
          title: "Pista de acceso inicial",
          content: "El servidor web tiene un directorio oculto con un panel de admin mal configurado.",
          level: 2,
          pointCost: 100,
          locked: true
        },
        {
          id: 3,
          title: "Pista de escalada",
          content: "Hay un archivo SUID configurado incorrectamente que puede ser explotado.",
          level: 3,
          pointCost: 150,
          locked: true
        }
      ];
    }
  },

  // Unlock a hint for a machine
  unlockHint: async (userId: string, machineId: string, hintLevel: number, pointCost: number): Promise<{ success: boolean; error?: string }> => {
    try {
      // First check if the hint is already unlocked
      const { data: existingHint, error: existingHintError } = await supabase
        .from('user_hints')
        .select('*')
        .eq('user_id', userId)
        .eq('machine_id', machineId)
        .eq('hint_level', hintLevel)
        .single();
      
      if (existingHint) {
        return { success: true }; // Hint already unlocked
      }
      
      // Check if user has enough points
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) {
        return { success: false, error: 'No se pudo verificar los puntos del usuario' };
      }
      
      if (profile.points < pointCost) {
        return { success: false, error: 'No tienes suficientes puntos para desbloquear esta pista' };
      }
      
      // Start a transaction to deduct points and unlock hint
      // Note: Supabase JS client doesn't support transactions directly, so we'll use separate queries
      
      // 1. Deduct points from user
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ points: profile.points - pointCost })
        .eq('id', userId);
      
      if (pointsError) {
        return { success: false, error: 'Error al actualizar los puntos del usuario' };
      }
      
      // 2. Record hint unlock
      const { error: hintError } = await supabase
        .from('user_hints')
        .insert({
          user_id: userId,
          machine_id: machineId,
          hint_level: hintLevel,
          points_spent: pointCost
        });
      
      if (hintError) {
        // If recording the hint fails, refund the points
        await supabase
          .from('profiles')
          .update({ points: profile.points })
          .eq('id', userId);
          
        return { success: false, error: 'Error al registrar la pista desbloqueada' };
      }
      
      // 3. Log activity
      await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_type: 'hint_unlocked',
        p_title: `Pista nivel ${hintLevel} desbloqueada para máquina ${machineId}`,
        p_points: -pointCost // Negative points because the user is spending points
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error al desbloquear la pista:', error);
      return { success: false, error: 'Error inesperado al desbloquear la pista' };
    }
  }
};

export default TaskHintService;
