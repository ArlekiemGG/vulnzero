
import { CTF, LeaderboardEntry, CTFSession, CTFRegistration } from './types';
import { LeaderboardService } from './services/LeaderboardService';
import { RegistrationService } from './services/RegistrationService';
import { CTFDataService } from './services/CTFDataService';

export const CTFService = {
  // Get active/upcoming CTFs
  getActiveCTFs: async (): Promise<CTF[]> => {
    return CTFDataService.getActiveCTFs();
  },

  // Get past CTFs
  getPastCTFs: async (): Promise<CTF[]> => {
    return CTFDataService.getPastCTFs();
  },

  // Get leaderboard data
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const leaderboard = await LeaderboardService.getLeaderboard();
    
    // Update leaderboard ranks in the database periodically
    // This is done separately to avoid blocking the UI
    setTimeout(() => {
      LeaderboardService.updateLeaderboardRanks().catch(console.error);
    }, 0);
    
    return leaderboard;
  },

  // Check if user is registered for a CTF
  isUserRegisteredForCTF: async (userId: string, ctfId: number): Promise<boolean> => {
    return RegistrationService.isUserRegisteredForCTF(userId, ctfId);
  },

  // Register user for CTF
  registerUserForCTF: async (userId: string, ctfId: number): Promise<{ success: boolean, registrationId?: string }> => {
    // Get the CTF details for activity logging
    let ctfName = '';
    const activeCTFs = await CTFDataService.getActiveCTFs();
    const ctf = activeCTFs.find(c => c.id === ctfId);
    if (ctf) {
      ctfName = ctf.name;
    }
    
    // Register the user
    const result = await RegistrationService.registerUserForCTF(userId, ctfId, ctfName);
    
    // Update leaderboard ranks after registration
    if (result.success) {
      setTimeout(() => {
        LeaderboardService.updateLeaderboardRanks().catch(console.error);
      }, 0);
    }
    
    return result;
  },

  // Get user's CTF registrations
  getUserCTFRegistrations: async (userId: string): Promise<CTFRegistration[]> => {
    return RegistrationService.getUserCTFRegistrations(userId);
  }
};

export default CTFService;
