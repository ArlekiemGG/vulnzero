
/**
 * Utilidades para validar respuestas de la API de máquinas
 */

import { ApiMachineRequestResponse, ApiMachineStatusResponse, ApiMachineReleaseResponse } from './types';

/**
 * Valida que una respuesta de solicitud de máquina contenga todos los campos necesarios
 */
export const validateMachineRequestResponse = (response: ApiMachineRequestResponse): boolean => {
  if (!response.exito) {
    return false;
  }

  // Verificar que todos los campos necesarios existan
  const requiredFields = ['sesionId', 'ipAcceso', 'puertoSSH', 'credenciales', 'tiempoLimite'];
  const missing = requiredFields.filter(field => !response[field as keyof ApiMachineRequestResponse]);
  
  if (missing.length > 0) {
    console.error('Respuesta de API incompleta. Campos faltantes:', missing);
    return false;
  }

  // Validar credenciales
  if (!response.credenciales?.usuario || !response.credenciales?.password) {
    console.error('Credenciales incompletas en la respuesta');
    return false;
  }

  return true;
};

/**
 * Valida que una respuesta de estado de máquina sea correcta
 */
export const validateMachineStatusResponse = (response: ApiMachineStatusResponse): boolean => {
  // La respuesta siempre debe tener el campo 'activa'
  if (typeof response.activa !== 'boolean') {
    console.error('Respuesta de estado inválida: falta campo activa');
    return false;
  }
  
  return true;
};

/**
 * Valida que una respuesta de liberación de máquina sea correcta
 */
export const validateMachineReleaseResponse = (response: ApiMachineReleaseResponse): boolean => {
  // La respuesta siempre debe tener el campo 'exito'
  if (typeof response.exito !== 'boolean') {
    console.error('Respuesta de liberación inválida: falta campo exito');
    return false;
  }
  
  return true;
};
