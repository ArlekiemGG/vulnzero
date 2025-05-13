import { leaderboard, userProfiles, type Profiles } from '@/integrations/supabase/client';
import { LeaderboardUser } from '@/components/leaderboard/LeaderboardTable';
import { toast } from '@/components/ui/use-toast';

/**
 * Transform database profiles into formatted leaderboard users
 */
export const mapProfilesToLeaderboardUsers = (
  profiles: Profiles[],
  currentUserId?: string
): LeaderboardUser[] => {
  if (!profiles || profiles.length === 0) {
    return [];
  }

  return profiles.map((profile, index) => ({
    id: profile.id,
    rank: index + 1,
    username: profile.username || 'Usuario',
    avatar: profile.avatar_url,
    points: profile.points || 0,
    level: profile.level || 1,
    solvedMachines: profile.solved_machines || 0,
    rankChange: 'same', // Could be calculated by comparing with previous data
    changeAmount: 0,     // Could be calculated by comparing with previous data
    isCurrentUser: currentUserId ? profile.id === currentUserId : false
  }));
};

/**
 * Fetch leaderboard data with error handling and delay between attempts
 */
export const fetchLeaderboardData = async (
  limit = 100, 
  offset = 0
): Promise<LeaderboardUser[]> => {
  try {
    // Added retries with exponential backoff for improved resilience
    let attempts = 0;
    const maxAttempts = 5; // Increased max attempts
    let lastError;
    
    while (attempts < maxAttempts) {
      try {
        // Wait before first attempt to reduce rate limiting issues
        if (attempts > 0) {
          // Exponential backoff with some randomization
          const delay = Math.pow(2, attempts) * 500 + Math.random() * 500;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const profiles = await leaderboard.get(limit, offset);
        // If we got an empty array but no error, try one more time with a delay
        if (profiles.length === 0 && attempts < maxAttempts - 1) {
          attempts++;
          continue;
        }
        return mapProfilesToLeaderboardUsers(profiles);
      } catch (error) {
        lastError = error;
        attempts++;
        console.log(`Leaderboard fetch attempt ${attempts} failed:`, error);
        
        // Don't wait on the last attempt
        if (attempts >= maxAttempts) {
          break;
        }
      }
    }
    
    console.error("All attempts to fetch leaderboard data failed:", lastError);
    throw lastError; // Throw the error to be handled by the query error handler
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    throw error; // Propagate error to React Query for proper handling
  }
};

/**
 * Get current user's leaderboard position
 */
export const getCurrentUserLeaderboardPosition = async (
  userId: string | undefined,
  allUsers: LeaderboardUser[]
): Promise<LeaderboardUser | null> => {
  if (!userId) return null;
  
  // Check if user is in the already loaded data
  const userInList = allUsers.find(user => user.id === userId);
  if (userInList) return userInList;
  
  // Otherwise, fetch user's profile and determine rank
  try {
    const userProfile = await userProfiles.get(userId);
    
    if (!userProfile) return null;
    
    // We would need to fetch total count of users with higher points
    // This is a simplified version
    return {
      id: userProfile.id,
      rank: 0, // Proper rank would be determined by comparing points
      username: userProfile.username || 'Usuario',
      avatar: userProfile.avatar_url,
      points: userProfile.points || 0,
      level: userProfile.level || 1,
      solvedMachines: userProfile.solved_machines || 0,
      rankChange: 'same',
      isCurrentUser: true,
      changeAmount: 0
    };
  } catch (error) {
    console.error("Error getting user leaderboard position:", error);
    return null;
  }
};
