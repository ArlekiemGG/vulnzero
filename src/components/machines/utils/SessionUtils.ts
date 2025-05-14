
/**
 * Calcula los minutos restantes de una sesión de máquina
 * @param expiresAt Fecha de expiración de la sesión
 * @returns Minutos restantes o 0 si ya expiró
 */
export const calculateRemainingTime = (expiresAt: string): number => {
  const now = new Date();
  const expires = new Date(expiresAt);
  const remainingTimeMinutes = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / (60 * 1000)));
  return remainingTimeMinutes;
};

/**
 * Verifica si una sesión está activa
 * @param expiresAt Fecha de expiración de la sesión
 * @param status Estado actual de la sesión
 * @returns Booleano indicando si la sesión está activa
 */
export const isSessionActive = (expiresAt: string, status: string): boolean => {
  return status === 'running' && calculateRemainingTime(expiresAt) > 0;
};
