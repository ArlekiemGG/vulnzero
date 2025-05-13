
// Supabase client with enhanced configuration and typed queries
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://locviruzkdfnhusfquuc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3ZpcnV6a2Rmbmh1c2ZxdXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODM1MTQsImV4cCI6MjA2MjY1OTUxNH0.VJW1juYE_poSS-FTBqoZxA5xSH9WY6vsW3upb-GvJ80";

// Export type definitions for easier use in components
export type Tables = Database['public']['Tables'];
export type Profiles = Tables['profiles']['Row'];

// Fixed client configuration with explicit schema definition
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage,
    storageKey: 'sb-auth-token',
  },
  global: {
    headers: {
      'x-application-name': 'vulnzero'
    }
  }
  // Remove the explicit schema setting that's causing issues
});

// Cache management with improved error handling
const responseCache = new Map();
const pendingRequests = new Map();
const requestCounts = new Map();
const REQUEST_LIMIT = 3;
const PENALTY_TIME = 30000;
const requestTimestamps = new Map();

/**
 * Enhanced cached request function with rate limiting and deduplication
 */
const cachedRequest = async (key: string, requestFn: () => Promise<any>, cacheDuration = 30000) => {
  // Rate limiting logic
  if (requestCounts.has(key)) {
    const count = requestCounts.get(key) || 0;
    const lastAttempt = requestTimestamps.get(key) || 0;
    const timeSinceLastAttempt = Date.now() - lastAttempt;
    
    if (count >= REQUEST_LIMIT && timeSinceLastAttempt < PENALTY_TIME) {
      console.log(`Too many requests for ${key}, enforcing cooldown (${Math.round((PENALTY_TIME - timeSinceLastAttempt)/1000)}s remaining)`);
      
      if (responseCache.has(key)) {
        console.log(`Returning stale cache for ${key} during cooldown period`);
        return responseCache.get(key).data;
      }
      
      return Promise.reject(new Error(`Request rate limited for ${key}. Try again later.`));
    }
    
    if (timeSinceLastAttempt > PENALTY_TIME) {
      requestCounts.set(key, 1);
    } else {
      requestCounts.set(key, count + 1);
    }
  } else {
    requestCounts.set(key, 1);
  }
  
  requestTimestamps.set(key, Date.now());

  // Check cache validity
  if (responseCache.has(key)) {
    const { data, expiry } = responseCache.get(key);
    if (expiry > Date.now()) {
      console.log(`Using cached data for ${key}`);
      return data;
    }
    responseCache.delete(key);
  }
  
  // Handle pending requests for deduplication
  if (pendingRequests.has(key)) {
    console.log(`Joining pending request for ${key}`);
    return pendingRequests.get(key);
  }
  
  // Create new request with timeout safety
  const requestPromise = Promise.race([
    requestFn(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Request timeout for ${key}`)), 15000)
    )
  ])
    .then(result => {
      responseCache.set(key, {
        data: result,
        expiry: Date.now() + cacheDuration
      });
      pendingRequests.delete(key);
      return result;
    })
    .catch(error => {
      pendingRequests.delete(key);
      
      if (responseCache.has(key)) {
        console.warn(`Request failed for ${key}, using stale cache data:`, error);
        return responseCache.get(key).data;
      }
      
      throw error;
    });
  
  pendingRequests.set(key, requestPromise);
  
  return requestPromise;
};

/**
 * Clear cache entries
 */
export const clearCache = (keyPattern?: string) => {
  if (keyPattern) {
    for (const key of responseCache.keys()) {
      if (key.includes(keyPattern)) {
        console.log(`Clearing cache for ${key}`);
        responseCache.delete(key);
        requestCounts.delete(key);
        requestTimestamps.delete(key);
      }
    }
  } else {
    responseCache.clear();
    requestCounts.clear();
    requestTimestamps.clear();
    console.log('Cleared all cache entries');
  }
};

/**
 * Type-safe query wrapper
 */
export const query = {
  /**
   * Safely execute a query with proper error handling
   */
  async safe<T = any>(
    table: keyof Tables, 
    builder: (query: any) => any
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const { data, error } = await builder(supabase.from(table));
      return { 
        data, 
        error: error ? new Error(error.message) : null 
      };
    } catch (error) {
      console.error("Query error:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  }
};

/**
 * Centralized user profile operations
 */
export const userProfiles = {
  /**
   * Get a user's profile by ID
   */
  async get(userId: string | undefined): Promise<Profiles | null> {
    if (!userId) return null;
    
    const cacheKey = `profile-${userId}`;
    
    return cachedRequest(cacheKey, async () => {
      console.log("Fetching user profile with ID:", userId);
      
      try {
        // Direct query approach instead of using query.safe to avoid schema issues
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error("Error fetching user profile:", error);
          throw error;
        }
        
        if (!data) {
          console.log("Profile not found, creating default profile");
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            return await userProfiles.createIfNotExists(
              userData.user.id,
              userData.user.user_metadata?.username || userData.user.email?.split('@')[0] || 'User'
            );
          }
          return null;
        }
        
        return data;
      } catch (err) {
        console.error("Failed to get user profile:", err);
        throw err;
      }
    });
  },
  
  /**
   * Create a user profile if it doesn't exist
   */
  async createIfNotExists(userId: string, username: string): Promise<Profiles | null> {
    if (!userId) return null;
    
    try {
      // Check if profile exists - direct query approach
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      // If profile doesn't exist, create it
      if (!existingProfile) {
        console.log("Creating new user profile");
        const { data, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: username || 'New User',
            points: 0,
            level: 1,
            solved_machines: 0,
            completed_challenges: 0
          })
          .select()
          .single();
        
        if (insertError) {
          console.error("Failed to create profile:", insertError);
          throw insertError;
        }
        
        return data;
      }
      
      // Return complete profile
      const { data: completeProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      return completeProfile;
    } catch (err) {
      console.error("Failed to create/check profile:", err);
      throw err;
    }
  },
  
  /**
   * Update a user's profile
   */
  async update(userId: string, data: Partial<Profiles>): Promise<{ error?: any }> {
    if (!userId) return { error: { message: 'User ID is required' } };
    
    try {
      const response = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);
      
      // Invalidate cache on successful update
      if (!response.error) {
        clearCache(`profile-${userId}`);
      }
      
      return response;
    } catch (err) {
      console.error("Failed to update profile:", err);
      return { error: err };
    }
  }
};

/**
 * Leaderboard operations
 */
export const leaderboard = {
  /**
   * Get leaderboard data with pagination
   */
  async get(limit = 100, offset = 0): Promise<Profiles[]> {
    const cacheKey = `leaderboard-${limit}-${offset}`;
    
    return cachedRequest(cacheKey, async () => {
      console.log("Fetching leaderboard data");
      
      try {
        // Direct query approach instead of using query.safe
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('points', { ascending: false })
          .range(offset, offset + limit - 1);
      
        if (error) {
          console.error("Failed to fetch leaderboard:", error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error("Error in leaderboard.get:", error);
        throw error;
      }
    }, 60000); // Cache for 1 minute
  }
};

// Add queries export to maintain backward compatibility with existing code
export const queries = {
  getUserProfile: async (userId: string) => {
    if (!userId) return null;
    return await userProfiles.get(userId);
  },
  
  // Add other query methods here to maintain compatibility
  getLeaderboard: async (limit = 100, offset = 0) => {
    return await leaderboard.get(limit, offset);
  }
};
