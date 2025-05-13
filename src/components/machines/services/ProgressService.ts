
import { supabase } from '@/integrations/supabase/client';
import { MachineProgress } from '../types/MachineTypes';
import { machines } from '../MachineData';

export const ProgressService = {
  // Get user progress for a specific machine
  getUserMachineProgress: async (userId: string, machineId: string): Promise<MachineProgress> => {
    try {
      // Check if the user has progress record for this machine in the database
      const { data: progressData, error: progressError } = await supabase
        .from('user_machine_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('machine_id', machineId)
        .single();
      
      // If there's existing progress data, use it
      if (progressData && !progressError) {
        return {
          machineId,
          userId,
          progress: progressData.progress,
          flags: progressData.flags || [],
          startedAt: progressData.started_at,
          lastActivityAt: progressData.last_activity_at,
          completedAt: progressData.completed_at
        };
      }
      
      // Check if the user has completed this machine through activities
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'machine_completed')
        .eq('title', machines.find(m => m.id === machineId)?.name || '');
      
      // If there are activities, the machine has been completed
      if (activities && activities.length > 0) {
        const completionData = {
          machineId,
          userId,
          progress: 100,
          flags: ['root.txt', 'user.txt'],
          startedAt: activities[0].created_at,
          completedAt: activities[0].created_at,
          lastActivityAt: activities[0].created_at
        };
        
        // Store this completion in the progress table for future reference
        await saveUserMachineProgress(userId, machineId, completionData);
        
        return completionData;
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
        
        const sessionProgress = {
          machineId,
          userId,
          progress: progressByTime,
          flags: [],
          startedAt: session.started_at,
          lastActivityAt: new Date().toISOString()
        };
        
        // Save the session-based progress
        await saveUserMachineProgress(userId, machineId, sessionProgress);
        
        return sessionProgress;
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
  
  // Update user progress for a specific machine
  updateUserMachineProgress: async (
    userId: string, 
    machineId: string, 
    progress: number, 
    flags: string[] = [], 
    completed: boolean = false
  ): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      
      const progressData: MachineProgress = {
        machineId,
        userId,
        progress,
        flags,
        lastActivityAt: now,
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
          flags: progressData.flags,
          last_activity_at: progressData.lastActivityAt,
          completed_at: progressData.completedAt,
        })
        .eq('user_id', userId)
        .eq('machine_id', machineId);
      
      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('user_machine_progress')
        .insert({
          user_id: userId,
          machine_id: machineId,
          progress: progressData.progress,
          flags: progressData.flags,
          started_at: progressData.startedAt || new Date().toISOString(),
          last_activity_at: progressData.lastActivityAt || new Date().toISOString(),
          completed_at: progressData.completedAt,
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving machine progress:', error);
    return false;
  }
};

export default ProgressService;
