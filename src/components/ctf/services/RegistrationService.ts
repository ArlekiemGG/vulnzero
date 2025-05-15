
import { supabase } from '@/integrations/supabase/client';
import { CTFRegistration } from '../types';
import { ActivityService } from '@/components/dashboard/ActivityService';

export const RegistrationService = {
  // Check if user is registered for a CTF
  isUserRegisteredForCTF: async (userId: string, ctfId: number): Promise<boolean> => {
    try {
      console.log(`Checking if user ${userId} is registered for CTF ${ctfId}...`);
      
      // Use direct query instead of RPC function
      const { data, error } = await supabase
        .from('ctf_registrations')
        .select('id')
        .eq('user_id', userId)
        .eq('ctf_id', ctfId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking registration status:', error);
        return false;
      }

      // If data exists, user is registered
      const isRegistered = !!data;
      console.log('Registration status:', isRegistered);
      return isRegistered;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  },

  // Register user for CTF
  registerUserForCTF: async (userId: string, ctfId: number, ctfName: string): Promise<{ success: boolean, registrationId?: string }> => {
    try {
      console.log(`Registering user ${userId} for CTF ${ctfId}...`);
      
      // Insert the registration directly instead of using RPC
      const { data, error } = await supabase
        .from('ctf_registrations')
        .insert({
          user_id: userId,
          ctf_id: ctfId
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error registering for CTF:', error);
        throw error;
      }
      
      // Log the activity for the user using our centralized activity service
      const activityResult = await ActivityService.logActivity(
        userId, 
        'ctf_registration', 
        `Registro en CTF: ${ctfName}`, 
        10  // Award some points for registering
      );
      
      console.log(`User ${userId} registered for CTF ${ctfId}, reg ID: ${data.id}, activity logged: ${activityResult}`);
      
      return { success: true, registrationId: data.id };
    } catch (error) {
      console.error('Error registering for CTF:', error);
      return { success: false };
    }
  },

  // Get user's CTF registrations
  getUserCTFRegistrations: async (userId: string): Promise<CTFRegistration[]> => {
    try {
      console.log(`Getting registrations for user ${userId}...`);
      
      const { data, error } = await supabase
        .from('ctf_registrations')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user CTF registrations:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} registrations for user ${userId}`);
      return (data as CTFRegistration[]) || [];
    } catch (error) {
      console.error('Error fetching user CTF registrations:', error);
      return [];
    }
  }
};

export default RegistrationService;
