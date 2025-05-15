
// Tipos para la API de gestión de máquinas
import { Json } from '@/integrations/supabase/types';

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

// Type that represents the allowed JSON structure for connection_info
export interface MachineConnectionInfo {
  puertoSSH?: number;
  username?: string;
  password?: string;
  sshCommand?: string;
  maxTimeMinutes?: number;
  services?: MachineService[];
  vulnerabilities?: MachineVulnerability[];
  vpnConfig?: string;  // Archivo de configuración OpenVPN
  webTerminalEnabled?: boolean; // Si la terminal web está habilitada
  [key: string]: any; // Allow additional properties to be compatible with Json type
}

// Servicios detectados en la máquina virtual
export interface MachineService {
  nombre: string;
  puerto: number;
  estado: string;
  version?: string;
  [key: string]: any; // Allow additional properties to be compatible with Json type
}

// Vulnerabilidades detectadas en la máquina
export interface MachineVulnerability {
  nombre: string;
  severidad: 'baja' | 'media' | 'alta' | 'crítica';
  descripcion?: string;
  cve?: string;
  [key: string]: any; // Allow additional properties to be compatible with Json type
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
  connectionInfo?: MachineConnectionInfo;
  machineDetails?: any;
  services?: MachineService[];
  vulnerabilities?: MachineVulnerability[];
  containerId?: string; // ID del contenedor Docker
  vpnConfigAvailable?: boolean; // Indica si hay un archivo VPN disponible
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
