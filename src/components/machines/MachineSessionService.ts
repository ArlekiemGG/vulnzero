import { MachineApi } from './services/session/api';
import { MachineSessionDbService, mapDbSessionToMachineSession } from './services/session/dbService';
import { MachineSession } from './services/session/types';

export type { MachineSession } from './services/session/types';

export const MachineSessionService = {
  // Request a new machine instance with better error handling and status updates
  requestMachine: async (userId: string, machineTypeId: string): Promise<MachineSession | null> => {
    try {
      console.log('Requesting machine:', machineTypeId, 'for user:', userId);
      
      // First, create a placeholder session in the database with 'requested' status
      const initialSession = await MachineSessionDbService.createInitialSession(userId, machineTypeId);
      console.log('Initial session created:', initialSession);
      
      // Call external API to provision a new machine
      console.log('Calling external API to provision machine...');
      const apiResponse = await MachineApi.requestMachine(userId, machineTypeId);
      console.log('API Response received:', apiResponse);

      if (!apiResponse.exito) {
        // Update session status to 'failed' if API call fails
        console.error('API call failed:', apiResponse.mensaje);
        await MachineSessionDbService.markSessionAsFailed(initialSession.id);
        throw new Error(apiResponse.mensaje || 'Error al solicitar la máquina');
      }
      
      // Verificar que todos los campos necesarios estén presentes
      if (!apiResponse.sesionId || !apiResponse.ipAcceso || !apiResponse.puertoSSH || 
          !apiResponse.credenciales || !apiResponse.tiempoLimite) {
        console.error('API response incomplete:', apiResponse);
        throw new Error('Respuesta de API incompleta');
      }
      
      console.log('Updating session with machine info...');
      // Update session with the information received from the API
      const updatedSession = await MachineSessionDbService.updateSessionWithMachineInfo(
        initialSession.id,
        apiResponse.sesionId,
        apiResponse.ipAcceso,
        apiResponse.puertoSSH,
        apiResponse.credenciales.usuario,
        apiResponse.credenciales.password,
        apiResponse.tiempoLimite,
        'provisioning' // Set to provisioning first, will be updated to running after machine is ready
      );
      console.log('Session updated:', updatedSession);

      // Set session to 'running' after checking machine status
      console.log('Checking machine status...');
      checkAndUpdateMachineStatus(apiResponse.sesionId, initialSession.id);

      return mapDbSessionToMachineSession(updatedSession);
    } catch (error) {
      console.error('Error requesting machine:', error);
      return null;
    }
  },

  // Get active machine sessions for a user
  getUserActiveSessions: async (userId: string): Promise<MachineSession[]> => {
    try {
      const sessions = await MachineSessionDbService.getUserActiveSessions(userId);

      // For each session, check its current status with the API
      for (const session of sessions) {
        if (session.session_id && session.session_id.indexOf('pending-') !== 0) {
          const statusResponse = await MachineApi.getMachineStatus(session.session_id);
          const currentStatus = statusResponse.activa ? 'running' : 'terminated';
          
          if (currentStatus !== session.status) {
            // Update status if it has changed
            await MachineSessionDbService.updateSessionStatus(session.id, currentStatus);
            session.status = currentStatus;
          }
        }
      }

      return sessions.map(mapDbSessionToMachineSession);
    } catch (error) {
      console.error('Error fetching user machine sessions:', error);
      return [];
    }
  },

  // Check machine status directly from API
  getMachineStatus: async (sessionId: string): Promise<string> => {
    try {
      const statusResponse = await MachineApi.getMachineStatus(sessionId);
      return statusResponse.activa ? 'running' : 'terminated';
    } catch (error) {
      console.error('Error checking machine status:', error);
      return 'failed';
    }
  },

  // Release/terminate a machine
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

  // Get user session history
  getUserSessionHistory: async (userId: string): Promise<any[]> => {
    try {
      return await MachineSessionDbService.getUserSessionHistory(userId);
    } catch (error) {
      console.error('Error fetching user session history:', error);
      return [];
    }
  }
};

// Helper function to check and update machine status
async function checkAndUpdateMachineStatus(sessionId: string, dbSessionId: string) {
  try {
    // Wait a bit for the machine to start up
    console.log(`Waiting for machine ${sessionId} to start...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check the status
    console.log('Checking machine status...');
    const statusResponse = await MachineApi.getMachineStatus(sessionId);
    console.log('Status response:', statusResponse);
    
    const status = statusResponse.activa ? 'running' : 'terminated';
    console.log(`Machine status: ${status}`);
    
    // Update in database
    await MachineSessionDbService.updateSessionStatus(dbSessionId, status);
    console.log(`Database updated with status: ${status}`);
  } catch (error) {
    console.error('Error updating machine status:', error);
  }
}
