
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
}

// External API configuration
const EXTERNAL_API_URL = "https://api.example.com"; // Replace with your actual API URL

export const MachineSessionService = {
  // Request a new machine instance
  requestMachine: async (userId: string, machineTypeId: string): Promise<MachineSession | null> => {
    try {
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
        const error = await response.json();
        throw new Error(error.message || 'Error al solicitar la máquina');
      }

      const data = await response.json();
      
      // Store session data in Supabase
      const { data: sessionData, error } = await supabase
        .from('machine_sessions')
        .insert({
          user_id: userId,
          machine_type_id: machineTypeId,
          session_id: data.sessionId,
          ip_address: data.ipAddress,
          username: data.username,
          password: data.password,
          connection_info: data.connectionInfo || {},
          status: data.status || 'provisioning',
          expires_at: new Date(Date.now() + (data.validTimeMinutes * 60 * 1000)).toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing machine session:', error);
        throw error;
      }

      return {
        id: sessionData.id,
        machineTypeId: sessionData.machine_type_id,
        sessionId: sessionData.session_id,
        status: sessionData.status as any,
        ipAddress: sessionData.ip_address,
        username: sessionData.username,
        password: sessionData.password,
        connectionInfo: sessionData.connection_info,
        startedAt: sessionData.started_at,
        expiresAt: sessionData.expires_at,
        terminatedAt: sessionData.terminated_at,
      };
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

      return sessions.map(session => {
        // Calculate remaining time
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        const remainingTimeMinutes = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (60 * 1000)));
        
        return {
          id: session.id,
          machineTypeId: session.machine_type_id,
          sessionId: session.session_id,
          status: session.status,
          ipAddress: session.ip_address,
          username: session.username,
          password: session.password,
          connectionInfo: session.connection_info,
          startedAt: session.started_at,
          expiresAt: session.expires_at,
          terminatedAt: session.terminated_at,
          remainingTimeMinutes,
          machineDetails: session.machine_types
        };
      });
    } catch (error) {
      console.error('Error fetching user machine sessions:', error);
      return [];
    }
  },

  // Check machine status
  getMachineStatus: async (sessionId: string): Promise<string> => {
    try {
      const response = await fetch(`${EXTERNAL_API_URL}/api/maquinas/estado`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sesionId: sessionId
        }),
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
