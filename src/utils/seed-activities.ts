
import { supabase } from '@/integrations/supabase/client';

/**
 * Seeds initial activity data for a user for testing purposes.
 * This function is disabled in production to prevent test data from appearing.
 */
export const seedUserActivities = async (userId: string) => {
  // Completamente desactivada para evitar datos de prueba
  console.log('Activity seeding disabled for production use');
  return;
};
