
import { supabase } from '@/integrations/supabase/client';
import { calculateRemainingTime } from './utils/SessionUtils';

// Interface for machine session information
export interface MachineSession {
  id: string;
  machineTypeId: string;
  sessionId: string;
  status: 'requested' | 'provisioning' | 'running' | 'terminated' | 'failed';
  ipAddress?: string;
  username?: string;
  password?: string;
  connectionInfo: Record<string, any>;
  startedAt: string;
  expiresAt: string;
  terminatedAt?: string;
  remainingTimeMinutes?: number;
  machineDetails?: {
    name: string;
    description: string;
    difficulty: string;
    os_type: string;
  };
}

// External API configuration for development and production
const EXTERNAL_API_URL = window.location.hostname.includes("localhost") 
  ? "http://localhost:5000"  // Local development
  : "https://api.vulnzero.es"; // Production

// Helper function to map database session to MachineSession interface
const mapDbSessionToMachineSession = (session: any): MachineSession => {
  const remainingTimeMinutes = calculateRemainingTime(session.expires_at);
  
  return {
    id: session.id,
    machineTypeId: session.machine_type_id,
    sessionId: session.session_id,
    status: session.status as 'requested' | 'provisioning' | 'running' | 'terminated' | 'failed',
    ipAddress: session.ip_address,
    username: session.username,
    password: session.password,
    connectionInfo: session.connection_info as Record<string, any>,
    startedAt: session.started_at,
    expiresAt: session.expires_at,
    terminatedAt: session.terminated_at,
    remainingTimeMinutes,
    machineDetails: session.machine_types
  };
};

export const MachineSessionService = {
  // Request a new machine instance
  requestMachine: async (userId: string, machineTypeId: string): Promise<MachineSession | null> => {
    try {
      console.log('Requesting machine:', machineTypeId, 'for user:', userId);
      
      // Call external API to provision a new machine
      const response = await fetch(`${EXTERNAL_API_URL}/api/maquinas/solicitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: userId,
          tipoMaquinaId: machineTypeId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', errorText);
        throw new Error(`Error al solicitar la máquina: ${response.status}`);
      }

      const data = await response.json();
      console.log('Machine requested successfully:', data);
      
      if (!data.exito) {
        throw new Error(data.mensaje || 'Error al solicitar la máquina');
      }
      
      // Store session data in Supabase
      const { data: sessionData, error } = await supabase
        .from('machine_sessions')
        .insert({
          user_id: userId,
          machine_type_id: machineTypeId,
          session_id: data.sesionId,
          ip_address: data.ipAcceso,
          status: 'running',
          connection_info: {
            puertoSSH: data.puertoSSH,
            username: data.credenciales.usuario,
            password: data.credenciales.password,
            sshCommand: `ssh ${data.credenciales.usuario}@${data.ipAcceso} -p ${data.puertoSSH}`,
            maxTimeMinutes: data.tiempoLimite / 60
          },
          username: data.credenciales.usuario,
          password: data.credenciales.password,
          expires_at: new Date(Date.now() + (data.tiempoLimite * 1000)).toISOString(),
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing machine session:', error);
        throw error;
      }

      return mapDbSessionToMachineSession(sessionData);
    } catch (error) {
      console.error('Error requesting machine:', error);
      return null;
    }
  },

  // Get active machine sessions for a user
  getUserActiveSessions: async (userId: string): Promise<MachineSession[]> => {
    try {
      const { data: sessions, error } = await supabase
        .from('machine_sessions')
        .select('*, machine_types(name, description, difficulty, os_type)')
        .eq('user_id', userId)
        .neq('status', 'terminated')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return sessions.map(mapDbSessionToMachineSession);
    } catch (error) {
      console.error('Error fetching user machine sessions:', error);
      return [];
    }
  },

  // Check machine status
  getMachineStatus: async (sessionId: string): Promise<string> => {
    try {
      const response = await fetch(`${EXTERNAL_API_URL}/api/maquinas/estado?sesionId=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al verificar estado de la máquina');
      }

      const data = await response.json();
      
      // Update status in database
      await supabase
        .from('machine_sessions')
        .update({
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      return data.status;
    } catch (error) {
      console.error('Error checking machine status:', error);
      return 'failed';
    }
  },

  // Release/terminate a machine
  terminateMachine: async (sessionId: string): Promise<boolean> => {
    try {
      // Call external API to release the machine
      const response = await fetch(`${EXTERNAL_API_URL}/api/maquinas/liberar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sesionId: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Error al liberar la máquina');
      }

      // Update status in database before deleting (for history logging via trigger)
      await supabase
        .from('machine_sessions')
        .update({
          status: 'terminated',
          terminated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
      
      // Delete from active sessions (triggers history logging)
      const { error } = await supabase
        .from('machine_sessions')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error terminating machine:', error);
      return false;
    }
  },

  // Get user session history
  getUserSessionHistory: async (userId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('machine_sessions_history')
        .select('*, machine_types(name, difficulty, os_type)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user session history:', error);
      return [];
    }
  }
};
