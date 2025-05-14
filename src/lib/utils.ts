
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Realiza una copia profunda de un objeto de forma segura
 * @param obj Objeto a copiar
 * @returns Copia profunda del objeto
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepClone) as unknown as T;
  }
  
  return Object.fromEntries(
    Object.entries(obj as Record<string, any>).map(
      ([k, v]) => [k, deepClone(v)]
    )
  ) as T;
}

/**
 * Optimiza la ejecución de funciones con throttling
 * @param callback Función a ejecutar
 * @param delay Tiempo en ms entre ejecuciones
 * @returns Función con throttling aplicado
 */
export function throttle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  };
}

/**
 * Formatea una fecha en formato legible
 * @param date Fecha a formatear
 * @returns Cadena con la fecha formateada
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
