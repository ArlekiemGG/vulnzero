
import { MachineSessionDbService } from './dbService';

/**
 * Handles machine session history functionality
 */
export const SessionHistoryService = {
  /**
   * Get user session history
   */
  getUserSessionHistory: async (userId: string): Promise<any[]> => {
    try {
      return await MachineSessionDbService.getUserSessionHistory(userId);
    } catch (error) {
      console.error('Error fetching user session history:', error);
      return [];
    }
  }
};
