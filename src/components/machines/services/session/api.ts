
// API para comunicarse con el backend de gestión de máquinas
import { ApiMachineRequestResponse, ApiMachineStatusResponse, ApiMachineReleaseResponse } from './types';

// Configuración del API URL para desarrollo y producción
const EXTERNAL_API_URL = window.location.hostname.includes("localhost") 
  ? "http://localhost:5000"  // Local development
  : "https://api.vulnzero.es"; // Production

export const MachineApi = {
  /**
   * Solicita una nueva instancia de máquina al backend
   */
  requestMachine: async (
    userId: string, 
    machineTypeId: string
  ): Promise<ApiMachineRequestResponse> => {
    try {
      console.log('Requesting machine from API:', machineTypeId, 'for user:', userId);
      
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
      return data;
    } catch (error) {
      console.error('Error in requestMachine API call:', error);
      return { 
        exito: false, 
        mensaje: error instanceof Error ? error.message : 'Error desconocido al solicitar máquina' 
      };
    }
  },

  /**
   * Verifica el estado de una máquina
   */
  getMachineStatus: async (sessionId: string): Promise<ApiMachineStatusResponse> => {
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
      return data;
    } catch (error) {
      console.error('Error checking machine status:', error);
      return { 
        activa: false, 
        mensaje: error instanceof Error ? error.message : 'Error desconocido al verificar estado'
      };
    }
  },

  /**
   * Libera una máquina
   */
  releaseMachine: async (sessionId: string): Promise<ApiMachineReleaseResponse> => {
    try {
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

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error releasing machine:', error);
      return { 
        exito: false, 
        mensaje: error instanceof Error ? error.message : 'Error desconocido al liberar máquina'
      };
    }
  }
};
