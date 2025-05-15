
// Validadores para las respuestas de la API

import { 
  ApiMachineRequestResponse, 
  ApiMachineStatusResponse, 
  ApiMachineReleaseResponse,
  MachineService,
  MachineVulnerability
} from './types';

/**
 * Valida que la respuesta de solicitud de máquina tenga todos los campos necesarios
 */
export function validateMachineRequestResponse(response: any): response is ApiMachineRequestResponse {
  if (!response || typeof response !== 'object') return false;
  
  // Verificar campo de éxito obligatorio
  if (typeof response.exito !== 'boolean') return false;
  
  // Si la respuesta no fue exitosa, solo necesitamos mensaje
  if (!response.exito) {
    return true;
  }
  
  // Para respuestas exitosas, verificar campos obligatorios
  return (
    typeof response.sesionId === 'string' &&
    typeof response.ipAcceso === 'string' &&
    typeof response.puertoSSH === 'number' &&
    response.credenciales && 
    typeof response.credenciales === 'object' &&
    typeof response.credenciales.usuario === 'string' &&
    typeof response.credenciales.password === 'string' &&
    typeof response.tiempoLimite === 'number'
  );
}

/**
 * Valida que la respuesta de estado de máquina tenga todos los campos necesarios
 */
export function validateMachineStatusResponse(response: any): response is ApiMachineStatusResponse {
  if (!response || typeof response !== 'object') return false;
  
  // Verificar campo activa obligatorio
  if (typeof response.activa !== 'boolean') return false;
  
  // Validar campos opcionales si están presentes
  if ('tiempoRestante' in response && typeof response.tiempoRestante !== 'number') {
    return false;
  }
  
  if ('estado' in response && typeof response.estado !== 'string') {
    return false;
  }
  
  if ('mensaje' in response && typeof response.mensaje !== 'string') {
    return false;
  }
  
  // Validar servicios si están presentes
  if ('detalles' in response) {
    if (!response.detalles || typeof response.detalles !== 'object') {
      return false;
    }
    
    // Validar servicios
    if ('servicios' in response.detalles) {
      if (!Array.isArray(response.detalles.servicios)) {
        return false;
      }
      
      // Validar cada servicio
      for (const servicio of response.detalles.servicios) {
        if (!validateMachineService(servicio)) {
          return false;
        }
      }
    }
    
    // Validar vulnerabilidades
    if ('vulnerabilidades' in response.detalles) {
      if (!Array.isArray(response.detalles.vulnerabilidades)) {
        return false;
      }
      
      // Validar cada vulnerabilidad
      for (const vuln of response.detalles.vulnerabilidades) {
        if (!validateMachineVulnerability(vuln)) {
          return false;
        }
      }
    }
  }
  
  return true;
}

/**
 * Valida que un objeto servicio tenga la estructura correcta
 */
function validateMachineService(service: any): service is MachineService {
  return (
    typeof service === 'object' &&
    typeof service.nombre === 'string' &&
    typeof service.puerto === 'number' &&
    typeof service.estado === 'string' &&
    (service.version === undefined || typeof service.version === 'string')
  );
}

/**
 * Valida que un objeto vulnerabilidad tenga la estructura correcta
 */
function validateMachineVulnerability(vuln: any): vuln is MachineVulnerability {
  return (
    typeof vuln === 'object' &&
    typeof vuln.nombre === 'string' &&
    ['baja', 'media', 'alta', 'crítica'].includes(vuln.severidad) &&
    (vuln.descripcion === undefined || typeof vuln.descripcion === 'string') &&
    (vuln.cve === undefined || typeof vuln.cve === 'string')
  );
}

/**
 * Valida que la respuesta de liberación de máquina tenga todos los campos necesarios
 */
export function validateMachineReleaseResponse(response: any): response is ApiMachineReleaseResponse {
  if (!response || typeof response !== 'object') return false;
  
  // Verificar campo de éxito obligatorio
  if (typeof response.exito !== 'boolean') return false;
  
  // Mensaje es opcional
  if ('mensaje' in response && typeof response.mensaje !== 'string') {
    return false;
  }
  
  return true;
}
