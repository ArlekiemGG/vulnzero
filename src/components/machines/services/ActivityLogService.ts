
import { supabase } from '@/integrations/supabase/client';
import { machines } from '../MachineData';

export const ActivityLogService = {
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
  }
};

export default ActivityLogService;
