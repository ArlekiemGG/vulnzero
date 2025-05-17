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
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
