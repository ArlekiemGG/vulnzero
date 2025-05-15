
// External API response types
export interface ApiMachineRequestResponse {
  exito: boolean;
  mensaje?: string;
  sesionId?: string;
  ipAcceso?: string;
  puertoSSH?: number;
  credenciales?: {
    usuario: string;
    password: string;
  };
  tiempoLimite?: number;
}

export interface ApiMachineStatusResponse {
  activa: boolean;
  mensaje?: string;
  estado?: string;
  tiempoRestante?: number;
  detalles?: {
    servicios?: MachineService[];
    vulnerabilidades?: MachineVulnerability[];
  };
}

export interface ApiMachineReleaseResponse {
  exito: boolean;
  mensaje?: string;
}

// Machine service information
export interface MachineService {
  nombre: string;
  puerto: number;
  estado: string;
  version?: string;
}

// Machine vulnerability information
export interface MachineVulnerability {
  nombre: string;
  severidad: string;
  descripcion?: string;
  cve?: string;
}

// Connection information
export interface MachineConnectionInfo {
  puertoSSH?: number;
  username?: string;
  password?: string;
  sshCommand?: string;
  maxTimeMinutes?: number;
  webTerminalEnabled?: boolean;
  services?: MachineService[];
  vulnerabilities?: MachineVulnerability[];
  containerId?: string;
  vpnConfig?: string;
}

// Internal machine session type used by the application
export interface MachineSession {
  id: string;
  machineTypeId: string;
  sessionId: string;
  status: 'requested' | 'provisioning' | 'running' | 'terminated' | 'failed';
  startedAt?: string;
  expiresAt?: string;
  terminatedAt?: string;
  ipAddress?: string;
  username?: string;
  password?: string;
  connectionInfo?: MachineConnectionInfo;
  remainingTimeMinutes?: number;
  services?: MachineService[];
  vulnerabilities?: MachineVulnerability[];
  machineDetails?: any;
  containerId?: string;
  vpnConfigAvailable?: boolean;
  mensaje?: string;
  exito?: boolean;
}
