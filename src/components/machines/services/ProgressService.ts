
import { supabase } from '@/integrations/supabase/client';
import { MachineProgress } from '../types/MachineTypes';
import { machines } from '../MachineData';

export const ProgressService = {
  // Get user progress for a specific machine
  getUserMachineProgress: async (userId: string, machineId: string): Promise<MachineProgress> => {
    try {
      console.log(`Obteniendo progreso para usuario ${userId} en máquina ${machineId}`);
      
      // Check if the user has progress record for this machine in the database
      const { data: progressData, error } = await supabase
        .from('user_machine_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('machine_id', machineId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 es "No se encontró ninguna fila"
        console.error('Error al obtener progreso:', error);
        throw error;
      }
      
      // Si hay datos de progreso existentes, usarlos
      if (progressData) {
        console.log(`Progreso encontrado para máquina ${machineId}:`, progressData);
        return {
          machineId,
          userId,
          progress: progressData.progress || 0,
          flags: progressData.flags || [],
          startedAt: progressData.started_at,
          lastActivityAt: progressData.last_activity_at,
          completedAt: progressData.completed_at,
          completedTasks: progressData.completed_tasks || []
        };
      }
      
      // Si no hay datos de progreso, crear un registro inicial
      console.log(`No se encontró progreso para máquina ${machineId}, creando registro inicial`);
      const initialProgress = {
        machineId,
        userId,
        progress: 0,
        flags: [],
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        completedTasks: []
      };
      
      // Guardar el progreso inicial en la base de datos
      await saveUserMachineProgress(userId, machineId, initialProgress);
      
      return initialProgress;
    } catch (error) {
      console.error('Error getting machine progress:', error);
      // Devolver un objeto de progreso vacío en caso de error
      return {
        machineId,
        userId,
        progress: 0,
        flags: []
      };
    }
  },
  
  // Update user progress for a specific machine
  updateUserMachineProgress: async (
    userId: string, 
    machineId: string, 
    progress: number, 
    flags: string[] = [], 
    completed: boolean = false,
    completedTasks: number[] = []
  ): Promise<boolean> => {
    try {
      console.log(`Actualizando progreso para usuario ${userId} en máquina ${machineId}`);
      console.log(`Nuevo progreso: ${progress}%, Flags: ${flags.join(', ')}`);
      console.log(`Tareas completadas: ${completedTasks.join(', ')}`);
      
      const now = new Date().toISOString();
      
      // Buscar el progreso actual para la máquina
      const { data: currentProgress } = await supabase
        .from('user_machine_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('machine_id', machineId)
        .single();
      
      // Si hay tareas completadas, incluirlas en el progreso
      const existingCompletedTasks = currentProgress?.completed_tasks || [];
      const allCompletedTasks = Array.from(new Set([...existingCompletedTasks, ...completedTasks]));
      
      const progressData: MachineProgress = {
        machineId,
        userId,
        progress,
        flags,
        lastActivityAt: now,
        completedTasks: allCompletedTasks
      };
      
      // If machine is completed, set completedAt
      if (completed || progress >= 100) {
        progressData.completedAt = now;
        
        // Also log a machine completion activity if not already logged
        const { data: existingActivities } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'machine_completed')
          .eq('title', machines.find(m => m.id === machineId)?.name || '');
          
        if (!existingActivities || existingActivities.length === 0) {
          const machineData = machines.find(m => m.id === machineId);
          if (machineData) {
            await supabase.rpc('log_user_activity', {
              p_user_id: userId,
              p_type: 'machine_completed',
              p_title: machineData.name,
              p_points: machineData.points || 0
            });
          }
        }
      }
      
      return await saveUserMachineProgress(userId, machineId, progressData);
    } catch (error) {
      console.error('Error updating machine progress:', error);
      return false;
    }
  },
  
  // Complete a specific task in a machine
  completeTask: async (
    userId: string,
    machineId: string,
    taskId: number,
    completed: boolean = true
  ): Promise<boolean> => {
    try {
      console.log(`${completed ? 'Completando' : 'Desmarcando'} tarea ${taskId} para usuario ${userId} en máquina ${machineId}`);
      
      // Obtener el progreso actual
      const { data: currentProgress } = await supabase
        .from('user_machine_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('machine_id', machineId)
        .single();
      
      if (!currentProgress) {
        // Si no hay progreso, crear un registro con la tarea completada
        const initialProgress = {
          userId,
          machineId,
          progress: 0,
          flags: [],
          completedTasks: completed ? [taskId] : []
        };
        
        return await saveUserMachineProgress(userId, machineId, initialProgress);
      }
      
      // Actualizar las tareas completadas
      let completedTasks = [...(currentProgress.completed_tasks || [])];
      
      if (completed && !completedTasks.includes(taskId)) {
        completedTasks.push(taskId);
      } else if (!completed && completedTasks.includes(taskId)) {
        completedTasks = completedTasks.filter(id => id !== taskId);
      }
      
      // Calcular el nuevo progreso en función de las tareas completadas
      // Esto asume que conocemos el número total de tareas para la máquina
      const machineData = machines.find(m => m.id === machineId);
      const totalTasks = machineData?.tasks?.length || 5; // Usar 5 como valor predeterminado si no conocemos las tareas
      const progress = Math.round((completedTasks.length / totalTasks) * 100);
      
      // Actualizar el progreso
      const { error } = await supabase
        .from('user_machine_progress')
        .update({
          completed_tasks: completedTasks,
          progress,
          last_activity_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('machine_id', machineId);
      
      if (error) {
        console.error('Error updating task completion:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  }
};

// Helper function to save user machine progress
const saveUserMachineProgress = async (
  userId: string,
  machineId: string,
  progressData: MachineProgress
): Promise<boolean> => {
  try {
    // First check if there's an existing record
    const { data: existingProgress } = await supabase
      .from('user_machine_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('machine_id', machineId)
      .single();
    
    if (existingProgress) {
      // Update existing record
      const { error } = await supabase
        .from('user_machine_progress')
        .update({
          progress: progressData.progress,
          flags: progressData.flags || existingProgress.flags,
          last_activity_at: progressData.lastActivityAt || new Date().toISOString(),
          completed_at: progressData.completedAt,
          completed_tasks: progressData.completedTasks || existingProgress.completed_tasks
        })
        .eq('user_id', userId)
        .eq('machine_id', machineId);
      
      if (error) {
        console.error('Error updating machine progress:', error);
        throw error;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('user_machine_progress')
        .insert({
          user_id: userId,
          machine_id: machineId,
          progress: progressData.progress,
          flags: progressData.flags || [],
          started_at: progressData.startedAt || new Date().toISOString(),
          last_activity_at: progressData.lastActivityAt || new Date().toISOString(),
          completed_at: progressData.completedAt,
          completed_tasks: progressData.completedTasks || []
        });
      
      if (error) {
        console.error('Error saving machine progress:', error);
        throw error;
      }
    }
    
    console.log(`Progreso guardado correctamente para máquina ${machineId}`);
    return true;
  } catch (error) {
    console.error('Error saving machine progress:', error);
    return false;
  }
};

export default ProgressService;
