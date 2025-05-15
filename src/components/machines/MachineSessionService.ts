
import { SessionManagementService } from './services/session/sessionManagement';
import { SessionOperationsService } from './services/session/sessionOperations';
import { SessionHistoryService } from './services/session/sessionHistory';
import { MachineSessionDbService, mapDbSessionToMachineSession } from './services/session/dbService';
import { 
  MachineSession, 
  MachineService, 
  MachineVulnerability,
  MachineConnectionInfo 
} from './services/session/types';

export type { MachineSession } from './services/session/types';

export const MachineSessionService = {
  // Request a new machine instance
  requestMachine: SessionManagementService.requestMachine,

  // Get active machine sessions for a user
  getUserActiveSessions: SessionManagementService.getUserActiveSessions,

  // Check machine status directly from API
  getMachineStatus: SessionOperationsService.getMachineStatus,
  
  // Execute a command on the machine via the API
  executeCommand: SessionOperationsService.executeCommand,

  // Release/terminate a machine
  terminateMachine: SessionOperationsService.terminateMachine,

  // Get user session history
  getUserSessionHistory: SessionHistoryService.getUserSessionHistory,
  
  // Get VPN configuration for a specific session
  getVpnConfig: SessionOperationsService.getVpnConfig
};
