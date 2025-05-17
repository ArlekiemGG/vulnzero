
import { v5 as uuidv5 } from 'uuid';

// Namespace to use for generating UUIDs
const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

/**
 * Generates a UUID from a string using the v5 algorithm
 */
export function generateUUID(input: string): string {
  return uuidv5(input, NAMESPACE);
}

/**
 * Normalizes an ID by converting it to UUID format if it's not already
 */
export function normalizeId(id: string): string {
  // If the ID is already a UUID, return it as is
  if (isValidUUID(id)) {
    return id;
  }
  
  // Otherwise, generate a UUID from the ID
  console.log(`normalizeId: "${id}" → "${generateUUID(id)}"`);
  return generateUUID(id);
}

/**
 * Checks if a string is a valid UUID
 */
export function isValidUUID(str: string): boolean {
  if (!str) return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Safely converts a string to UUID for database operations
 * This function can be used directly in database queries to ensure proper format
 * and handle errors appropriately
 */
export function toDbUUID(id: string): string {
  try {
    // If empty or null, return empty string
    if (!id) return '';
    
    // If already a valid UUID, use directly
    if (isValidUUID(id)) {
      return id;
    }
    
    // Otherwise convert to UUID format
    return generateUUID(id);
  } catch (error) {
    console.error("Error converting to UUID:", error);
    throw new Error(`Could not convert "${id}" to a valid UUID`);
  }
}

/**
 * Safely handles UUIDs for database operations, ensuring all IDs are
 * properly formatted whether they're already UUIDs or need conversion
 */
export function safelyHandleDbId(id: string): string {
  try {
    // Only normalize if the ID exists and is not already a valid UUID
    if (id && !isValidUUID(id)) {
      const normalizedId = normalizeId(id);
      console.log(`safelyHandleDbId: normalized "${id}" → "${normalizedId}"`);
      return normalizedId;
    }
    return id;
  } catch (error) {
    console.error(`Failed to safely handle ID "${id}":`, error);
    // In case of error, return the original to avoid completely breaking functionality
    return id;
  }
}
