
import { MachineApi } from './api';
import { MachineSessionDbService, mapDbSessionToMachineSession } from './dbService';
import { MachineSession, MachineService, MachineVulnerability } from './types';

/**
 * Handles machine session management functionality
 */
export const SessionManagementService = {
  /**
   * Request a new machine instance with better error handling and status updates
   */
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
      
      // Verify that all required fields are present
      if (!apiResponse.sesionId || !apiResponse.ipAcceso || !apiResponse.puertoSSH || 
          !apiResponse.credenciales || !apiResponse.tiempoLimite) {
        console.error('API response incomplete:', apiResponse);
        await MachineSessionDbService.markSessionAsFailed(initialSession.id);
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
        'provisioning', // Set to provisioning first, will be updated to running after machine is ready
        apiResponse.containerId // Add container ID if available
      );
      console.log('Session updated:', updatedSession);

      // Set session to 'running' after checking machine status
      console.log('Checking machine status...');
      checkAndUpdateMachineStatus(apiResponse.sesionId, initialSession.id);

      const mappedSession = mapDbSessionToMachineSession(updatedSession);
      
      // Pass along any messages from the API
      if (apiResponse.mensaje) {
        mappedSession.mensaje = apiResponse.mensaje;
      }
      
      return mappedSession;
    } catch (error) {
      console.error('Error requesting machine:', error);
      return null;
    }
  },

  /**
   * Get active machine sessions for a user
   */
  getUserActiveSessions: async (userId: string): Promise<MachineSession[]> => {
    try {
      const sessions = await MachineSessionDbService.getUserActiveSessions(userId);

      // For each session, check its current status with the API
      for (const session of sessions) {
        if (session.session_id && session.session_id.indexOf('pending-') !== 0) {
          // Get complete session information from the API
          const statusResponse = await MachineApi.getMachineStatus(session.session_id);
          const currentStatus = statusResponse.activa ? 'running' : 'terminated';
          
          // If the response includes service and vulnerability details, save them
          let services: MachineService[] = [];
          let vulnerabilities: MachineVulnerability[] = [];
          
          if (statusResponse.detalles) {
            if (statusResponse.detalles.servicios) {
              services = statusResponse.detalles.servicios;
            }
            
            if (statusResponse.detalles.vulnerabilidades) {
              vulnerabilities = statusResponse.detalles.vulnerabilidades;
            }
          }
          
          if (currentStatus !== session.status || services.length > 0 || vulnerabilities.length > 0) {
            // Update status if it has changed and add service/vulnerability info
            await MachineSessionDbService.updateSessionWithDetails(
              session.id, 
              currentStatus, 
              services, 
              vulnerabilities
            );
            session.status = currentStatus;
          }
        }
      }

      // Convert DB sessions to MachineSession interface and add service info
      return sessions.map(session => {
        const machineSession = mapDbSessionToMachineSession(session);
        return machineSession;
      });
    } catch (error) {
      console.error('Error fetching user machine sessions:', error);
      return [];
    }
  },
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
    
    // If there's service and vulnerability information, save it
    let services: MachineService[] = [];
    let vulnerabilities: MachineVulnerability[] = [];
    
    if (statusResponse.detalles) {
      if (statusResponse.detalles.servicios) {
        services = statusResponse.detalles.servicios;
      }
      
      if (statusResponse.detalles.vulnerabilidades) {
        vulnerabilities = statusResponse.detalles.vulnerabilidades;
      }
    }
    
    // Update in database with machine details
    await MachineSessionDbService.updateSessionWithDetails(dbSessionId, status, services, vulnerabilities);
    console.log(`Database updated with status: ${status} and machine details`);
  } catch (error) {
    console.error('Error updating machine status:', error);
  }
}
