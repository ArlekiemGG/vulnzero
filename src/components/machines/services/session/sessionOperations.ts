
import { MachineApi } from './api';
import { MachineSessionDbService } from './dbService';

/**
 * Handles machine session operations functionality
 */
export const SessionOperationsService = {
  /**
   * Check machine status directly from API
   */
  getMachineStatus: async (sessionId: string): Promise<string> => {
    try {
      const statusResponse = await MachineApi.getMachineStatus(sessionId);
      return statusResponse.activa ? 'running' : 'terminated';
    } catch (error) {
      console.error('Error checking machine status:', error);
      return 'failed';
    }
  },
  
  /**
   * Execute a command on the machine via the API
   */
  executeCommand: async (sessionId: string, command: string): Promise<{success: boolean, output: string}> => {
    try {
      return await MachineApi.executeCommand(sessionId, command);
    } catch (error) {
      console.error('Error executing command:', error);
      return {
        success: false,
        output: error instanceof Error ? error.message : 'Error ejecutando comando'
      };
    }
  },

  /**
   * Release/terminate a machine
   */
  terminateMachine: async (sessionId: string): Promise<boolean> => {
    try {
      // Call external API to release the machine
      const releaseResponse = await MachineApi.releaseMachine(sessionId);

      if (!releaseResponse.exito) {
        throw new Error(releaseResponse.mensaje || 'Error al liberar la máquina');
      }

      // Update status in database before deleting (for history logging via trigger)
      await MachineSessionDbService.updateSessionStatus(sessionId, 'terminated');
      
      // Delete from active sessions (triggers history logging)
      await MachineSessionDbService.deleteSession(sessionId);

      return true;
    } catch (error) {
      console.error('Error terminating machine:', error);
      return false;
    }
  },
  
  /**
   * Get VPN configuration for a specific session
   */
  getVpnConfig: async (sessionId: string): Promise<string | null> => {
    try {
      return await MachineSessionDbService.getVpnConfig(sessionId);
    } catch (error) {
      console.error('Error getting VPN config:', error);
      return null;
    }
  }
};
