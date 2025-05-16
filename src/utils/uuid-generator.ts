
/**
 * Utilidad para generar UUIDs deterministas basados en strings
 * Esto garantiza que el mismo string siempre generará el mismo UUID
 */

import { v5 as uuidv5 } from 'uuid';

// Espacio de nombres personalizado para nuestra aplicación
// Usamos un UUID v4 aleatorio generado previamente como namespace
const NAMESPACE = '2f8b5fb2-07bc-4db9-b58b-c241c9615f6d';

/**
 * Genera un UUID determinista basado en una cadena
 * @param input String que se usará como base para generar el UUID
 * @returns UUID v5 determinista
 */
export function generateUUID(input: string): string {
  if (!input) {
    console.error('generateUUID: Input string is empty');
    return '';
  }
  
  // Normalizar el input para mayor consistencia
  const normalizedInput = String(input).trim().toLowerCase();
  
  // Añadir logging para debug
  const result = uuidv5(normalizedInput, NAMESPACE);
  console.log(`generateUUID: Converting "${input}" to UUID: ${result}`);
  return result;
}

/**
 * Verifica si un string es un UUID válido
 * @param id String a verificar
 * @returns true si es un UUID válido, false en caso contrario
 */
export function isValidUUID(id: string): boolean {
  if (!id) return false;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
}

/**
 * Normaliza un ID a UUID si es necesario
 * @param id ID a normalizar
 * @returns UUID válido
 */
export function normalizeId(id: string): string {
  if (!id) {
    console.error('normalizeId: ID is empty');
    return '';
  }
  
  const normalizedId = isValidUUID(id) ? id : generateUUID(id);
  console.log(`normalizeId: Normalized "${id}" to "${normalizedId}"`);
  return normalizedId;
}
