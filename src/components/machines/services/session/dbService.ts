
// Operaciones de base de datos para las sesiones de máquinas
import { supabase } from '@/integrations/supabase/client';
import { MachineSession } from './types';
import { calculateRemainingTime } from '../../utils/SessionUtils';

// Helper function to map database session to MachineSession interface
export const mapDbSessionToMachineSession = (session: any): MachineSession => {
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

export const MachineSessionDbService = {
  /**
   * Crea una sesión inicial para una máquina solicitada
   */
  createInitialSession: async (
    userId: string,
    machineTypeId: string,
    initialStatus: string = 'requested'
  ) => {
    const placeholderExpireDate = new Date(Date.now() + (120 * 60 * 1000)).toISOString(); // Default 2 hours
    const tempSessionId = 'pending-' + Date.now(); // Temporary session ID until we get the real one
      
    const { data: initialSession, error: initialError } = await supabase
      .from('machine_sessions')
      .insert({
        user_id: userId,
        machine_type_id: machineTypeId,
        status: initialStatus,
        started_at: new Date().toISOString(),
        expires_at: placeholderExpireDate,
        session_id: tempSessionId
      })
      .select()
      .single();
      
    if (initialError) {
      console.error('Error creating initial session:', initialError);
      throw new Error('Error al iniciar el proceso de solicitud de máquina');
    }
    
    return initialSession;
  },

  /**
   * Actualiza una sesión existente con información de la máquina
   */
  updateSessionWithMachineInfo: async (
    sessionDbId: string,
    sessionId: string,
    ipAddress: string,
    sshPort: number,
    username: string,
    password: string,
    timeLimit: number,
    status: string = 'provisioning'
  ) => {
    const { data: sessionData, error } = await supabase
      .from('machine_sessions')
      .update({
        session_id: sessionId,
        ip_address: ipAddress,
        status: status,
        connection_info: {
          puertoSSH: sshPort,
          username: username,
          password: password,
          sshCommand: `ssh ${username}@${ipAddress} -p ${sshPort}`,
          maxTimeMinutes: timeLimit / 60
        },
        username: username,
        password: password,
        expires_at: new Date(Date.now() + (timeLimit * 1000)).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionDbId)
      .select()
      .single();

    if (error) {
      console.error('Error updating machine session:', error);
      throw error;
    }

    return sessionData;
  },

  /**
   * Marca una sesión como fallida
   */
  markSessionAsFailed: async (sessionDbId: string) => {
    return await supabase
      .from('machine_sessions')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionDbId);
  },

  /**
   * Actualiza el estado de una sesión
   */
  updateSessionStatus: async (sessionDbId: string, status: string) => {
    const updates: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (status === 'terminated') {
      updates.terminated_at = new Date().toISOString();
    }

    return await supabase
      .from('machine_sessions')
      .update(updates)
      .eq('id', sessionDbId);
  },

  /**
   * Obtiene las sesiones activas de un usuario
   */
  getUserActiveSessions: async (userId: string) => {
    const { data: sessions, error } = await supabase
      .from('machine_sessions')
      .select('*, machine_types(name, description, difficulty, os_type)')
      .eq('user_id', userId)
      .neq('status', 'terminated')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return sessions;
  },
  
  /**
   * Elimina una sesión (generalmente después de terminarla)
   */
  deleteSession: async (sessionId: string) => {
    const { error } = await supabase
      .from('machine_sessions')
      .delete()
      .eq('session_id', sessionId);
      
    if (error) {
      throw error;
    }
    
    return true;
  },

  /**
   * Obtiene el historial de sesiones de un usuario
   */
  getUserSessionHistory: async (userId: string) => {
    const { data, error } = await supabase
      .from('machine_sessions_history')
      .select('*, machine_types(name, difficulty, os_type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }
};
