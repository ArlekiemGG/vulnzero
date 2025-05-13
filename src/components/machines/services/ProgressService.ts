
import { supabase } from '@/integrations/supabase/client';
import { MachineProgress } from '../types/MachineTypes';
import { machines } from '../MachineData';

export const ProgressService = {
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
  }
};

export default ProgressService;
