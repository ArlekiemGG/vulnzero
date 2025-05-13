
import { supabase } from '@/integrations/supabase/client';
import { Challenge } from './ChallengeCard';
import { ActivityService } from '../dashboard/ActivityService';

/**
 * Service for challenges-related operations
 */
export const ChallengeService = {
  /**
   * Gets all challenges
   */
  getChallenges: async (userId?: string): Promise<Challenge[]> => {
    try {
      // Get mock challenges for now (would be replaced with API call in production)
      const challenges = getMockChallenges();
      
      // If userId is provided, check which challenges the user has completed
      if (userId) {
        const { data: activities } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'challenge_completed');
        
        // Mark challenges as completed based on user's activity history
        if (activities && activities.length > 0) {
          // Extract challenge titles from activities (format: "Desafío: <challenge-title>")
          const completedTitles = activities.map(activity => 
            activity.title.replace('Desafío: ', '')
          );
          
          // Update completion status for each challenge
          return challenges.map(challenge => ({
            ...challenge,
            isCompleted: completedTitles.includes(challenge.title)
          }));
        }
      }
      
      // Return challenges with default completion status
      return challenges;
    } catch (error) {
      console.error('Error al obtener los desafíos:', error);
      return getMockChallenges();
    }
  },

  /**
   * Gets a challenge by id
   */
  getChallengeById: async (id: string, userId?: string): Promise<Challenge | null> => {
    try {
      const challenges = await ChallengeService.getChallenges(userId);
      return challenges.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Error al obtener el desafío:', error);
      return null;
    }
  },
  
  /**
   * Gets the active weekly challenge with user progress
   */
  getActiveWeeklyChallenge: async (userId: string) => {
    try {
      // Get all challenges
      const challenges = await ChallengeService.getChallenges(userId);
      
      // Find the first active challenge
      const activeChallenge = challenges.find(c => c.isActive && !c.isCompleted);
      
      if (!activeChallenge) return null;
      
      // Get user profile to check their progress on solved machines
      const { data: profile } = await supabase
        .from('profiles')
        .select('solved_machines')
        .eq('id', userId)
        .single();
      
      // Get user's recent machine completions (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: recentActivities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'machine_completed')
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false });
      
      // Calculate progress based on recent activities
      const weeklyProgress = recentActivities ? recentActivities.length : 0;
      
      // For this example, we assume the challenge requires completing 3 machines
      const challengeTotal = 3;
      
      return {
        id: activeChallenge.id,
        title: activeChallenge.title,
        progress: weeklyProgress,
        total: challengeTotal,
        points: activeChallenge.points,
        isCompleted: weeklyProgress >= challengeTotal
      };
    } catch (error) {
      console.error('Error getting active weekly challenge:', error);
      return null;
    }
  },
  
  /**
   * Marks a challenge as completed for a user
   */
  completeChallenge: async (userId: string, challenge: Challenge): Promise<boolean> => {
    try {
      // Log the challenge completion activity
      const success = await ActivityService.logActivity(
        userId, 
        'challenge_completed', 
        `Desafío: ${challenge.title}`, 
        challenge.points
      );
      
      if (success) {
        // Get current profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('completed_challenges')
          .eq('id', userId)
          .single();
          
        if (profile) {
          // Update user profile to increment completed challenges count
          await supabase
            .from('profiles')
            .update({ 
              completed_challenges: (profile.completed_challenges || 0) + 1
            })
            .eq('id', userId);
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error al completar el desafío:', error);
      return false;
    }
  }
};

/**
 * Helper function that returns mock challenges for development
 * In a production environment, this would be replaced with a database call
 */
const getMockChallenges = (): Challenge[] => {
  return [
    { 
      id: "web-101", 
      title: 'Web Exploitation 101', 
      category: 'Web', 
      points: 100, 
      isCompleted: false,
      description: 'Explora vulnerabilidades comunes en aplicaciones web como XSS, CSRF, SQLi y más.',
      startDate: '2025-05-01',
      endDate: '2025-06-20',
      participants: 235,
      isActive: true
    },
    { 
      id: "rev-basics",
      title: 'Reverse Engineering Basics', 
      category: 'Reverse Engineering', 
      points: 150, 
      isCompleted: false,
      description: 'Aprende a analizar binarios y comprender su funcionamiento interno mediante técnicas de ingeniería inversa.',
      startDate: '2025-05-05',
      endDate: '2025-06-25',
      participants: 187,
      isActive: true
    },
    { 
      id: "crypto-chal",
      title: 'Cryptography Challenges', 
      category: 'Cryptography', 
      points: 200, 
      isCompleted: false,
      description: 'Desafíos para romper esquemas criptográficos mal implementados y entender algoritmos criptográficos.',
      startDate: '2025-05-10',
      endDate: '2025-06-30',
      participants: 156,
      isActive: true
    },
    { 
      id: "net-analysis",
      title: 'Network Analysis', 
      category: 'Network', 
      points: 120, 
      isCompleted: false,
      description: 'Analiza capturas de paquetes para encontrar información relevante y detectar anomalías en el tráfico de red.',
      startDate: '2025-05-01',
      endDate: '2025-05-31',
      participants: 203,
      isActive: true
    },
    { 
      id: "osint-chal",
      title: 'OSINT Challenge', 
      category: 'OSINT', 
      points: 180, 
      isCompleted: false,
      description: 'Utiliza técnicas de recopilación de inteligencia de fuentes abiertas para encontrar información oculta.',
      startDate: '2025-05-15',
      endDate: '2025-07-05',
      participants: 178,
      isActive: false
    },
    { 
      id: "binary-exp",
      title: 'Binary Exploitation', 
      category: 'Exploitation', 
      points: 250, 
      isCompleted: false,
      description: 'Explota vulnerabilidades en aplicaciones binarias utilizando técnicas como buffer overflows y ROP.',
      startDate: '2025-05-20',
      endDate: '2025-07-10',
      participants: 124,
      isActive: true
    },
  ];
};
