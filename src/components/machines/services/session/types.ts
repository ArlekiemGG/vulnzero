
// Tipos para la API de gestión de máquinas

// Respuesta de la API al solicitar una máquina
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

// Respuesta de la API al verificar el estado de una máquina
export interface ApiMachineStatusResponse {
  activa: boolean;
  tiempoRestante?: number;
  estado?: string;
  mensaje?: string;
  detalles?: {
    servicios: MachineService[];
    vulnerabilidades: MachineVulnerability[];
  };
}

// Servicios detectados en la máquina virtual
export interface MachineService {
  nombre: string;
  puerto: number;
  estado: string;
  version?: string;
}

// Vulnerabilidades detectadas en la máquina
export interface MachineVulnerability {
  nombre: string;
  severidad: 'baja' | 'media' | 'alta' | 'crítica';
  descripcion?: string;
  cve?: string;
}

// Respuesta de la API al liberar una máquina
export interface ApiMachineReleaseResponse {
  exito: boolean;
  mensaje?: string;
}

// Información completa de una sesión de máquina
export interface MachineSession {
  id: string;
  machineTypeId: string;
  sessionId: string;
  status: 'requested' | 'provisioning' | 'running' | 'terminated' | 'failed';
  ipAddress?: string;
  username?: string;
  password?: string;
  startedAt: string;
  expiresAt: string;
  terminatedAt?: string;
  remainingTimeMinutes?: number;
  connectionInfo?: Record<string, any>;
  machineDetails?: any;
  services?: MachineService[];
  vulnerabilities?: MachineVulnerability[];
}

// Estructura para el historial de sesiones
export interface MachineSessionHistory {
  id: string;
  userId: string;
  machineTypeId: string;
  sessionId: string;
  status: string;
  startedAt: string;
  terminatedAt: string;
  durationMinutes?: number;
}
