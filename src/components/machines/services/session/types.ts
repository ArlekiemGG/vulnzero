
// Interfaces y tipos para el sistema de sesiones de máquinas

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

export interface ApiMachineRequestResponse {
  exito: boolean;
  sesionId?: string;
  ipAcceso?: string;
  puertoSSH?: number;
  credenciales?: { 
    usuario: string;
    password: string;
  };
  tiempoLimite?: number;
  mensaje?: string;
}

export interface ApiMachineStatusResponse {
  activa: boolean;
  tiempoRestante?: number;
  status?: string;
  mensaje?: string;
}

export interface ApiMachineReleaseResponse {
  exito: boolean;
  mensaje?: string;
}
