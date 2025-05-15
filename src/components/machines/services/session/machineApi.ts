
import { EXTERNAL_API_URL, API_TIMEOUT, fetchWithTimeout } from './config';
import { ApiMachineRequestResponse, ApiMachineStatusResponse, ApiMachineReleaseResponse } from './types';
import { validateMachineRequestResponse, validateMachineStatusResponse, validateMachineReleaseResponse } from './validator';

export const MachineApi = {
  /**
   * Request a new machine instance from the backend
   */
  requestMachine: async (
    userId: string, 
    machineTypeId: string
  ): Promise<ApiMachineRequestResponse & { containerId?: string }> => {
    try {
      console.log('Requesting machine from API:', machineTypeId, 'for user:', userId);
      
      // Validate input parameters
      if (!userId || !machineTypeId) {
        throw new Error('Se requiere ID de usuario y tipo de máquina');
      }
      
      const requestBody = {
        usuarioId: userId,
        tipoMaquinaId: machineTypeId
      };
      
      console.log(`Enviando solicitud a ${EXTERNAL_API_URL}/api/maquinas/solicitar con datos:`, requestBody);
      
      const response = await fetchWithTimeout(
        `${EXTERNAL_API_URL}/api/maquinas/solicitar`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        },
        API_TIMEOUT
      );

      console.log('Respuesta recibida:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Error al solicitar la máquina: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Datos recibidos de la API:', data);
      
      // Validate the response
      if (!validateMachineRequestResponse(data)) {
        console.error('Respuesta inválida del API:', data);
        throw new Error('La respuesta del API no contiene todos los datos necesarios');
      }
      
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
   * Check machine status
   */
  getMachineStatus: async (sessionId: string): Promise<ApiMachineStatusResponse> => {
    try {
      // Validate input parameter
      if (!sessionId) {
        throw new Error('Se requiere ID de sesión');
      }
      
      const response = await fetchWithTimeout(
        `${EXTERNAL_API_URL}/api/maquinas/estado?sesionId=${sessionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        API_TIMEOUT
      );

      if (!response.ok) {
        throw new Error('Error al verificar estado de la máquina');
      }

      const data = await response.json();
      
      // Validate the response
      if (!validateMachineStatusResponse(data)) {
        throw new Error('Respuesta de estado inválida');
      }
      
      return data;
    } catch (error) {
      console.error('Error checking machine status:', error);
      return { 
        activa: false, 
        mensaje: error instanceof Error ? error.message : 'Error desconocido al verificar estado',
        estado: 'error',
        detalles: {
          servicios: [],
          vulnerabilidades: []
        }
      };
    }
  },

  /**
   * Release a machine
   */
  releaseMachine: async (sessionId: string): Promise<ApiMachineReleaseResponse> => {
    try {
      // Validate input parameter
      if (!sessionId) {
        throw new Error('Se requiere ID de sesión');
      }
      
      const response = await fetchWithTimeout(
        `${EXTERNAL_API_URL}/api/maquinas/liberar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sesionId: sessionId
          }),
        },
        API_TIMEOUT
      );

      if (!response.ok) {
        throw new Error('Error al liberar la máquina');
      }

      const data = await response.json();
      
      // Validate the response
      if (!validateMachineReleaseResponse(data)) {
        throw new Error('Respuesta de liberación inválida');
      }
      
      return data;
    } catch (error) {
      console.error('Error releasing machine:', error);
      return { 
        exito: false, 
        mensaje: error instanceof Error ? error.message : 'Error desconocido al liberar máquina'
      };
    }
  },
  
  /**
   * Execute a command on the machine via SSH
   */
  executeCommand: async (sessionId: string, command: string): Promise<{success: boolean, output: string}> => {
    try {
      // Validate input parameters
      if (!sessionId || !command) {
        throw new Error('Se requiere ID de sesión y comando');
      }
      
      const response = await fetchWithTimeout(
        `${EXTERNAL_API_URL}/api/maquinas/comando`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            command
          }),
        },
        API_TIMEOUT * 2 // Commands may take longer
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al ejecutar comando: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error executing command:', error);
      return { 
        success: false, 
        output: error instanceof Error ? error.message : 'Error de comunicación con la máquina'
      };
    }
  },
  
  /**
   * Download OpenVPN configuration to connect to the machine
   */
  downloadVpnConfig: async (sessionId: string): Promise<{ success: boolean, config?: string }> => {
    try {
      if (!sessionId) {
        throw new Error('Se requiere ID de sesión');
      }
      
      const response = await fetchWithTimeout(
        `${EXTERNAL_API_URL}/api/maquinas/vpn-config?sesionId=${sessionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        API_TIMEOUT
      );

      if (!response.ok) {
        throw new Error('Error al obtener la configuración VPN');
      }

      const data = await response.json();
      
      if (!data.exito || !data.config) {
        throw new Error(data.mensaje || 'Configuración VPN no disponible');
      }
      
      return {
        success: true,
        config: data.config
      };
    } catch (error) {
      console.error('Error downloading VPN config:', error);
      return { 
        success: false
      };
    }
  }
};
