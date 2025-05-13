
import { supabase } from '@/integrations/supabase/client';
import { Challenge } from './ChallengeCard';

/**
 * Service for challenges-related operations
 */
export const ChallengeService = {
  /**
   * Gets all challenges
   */
  getChallenges: async (): Promise<Challenge[]> => {
    try {
      // In a real implementation, this would fetch data from Supabase
      // For now, we'll return mock data
      return [
        { 
          id: "web-101", 
          title: 'Web Exploitation 101', 
          category: 'Web', 
          points: 100, 
          isCompleted: true,
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
          isCompleted: true,
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
    } catch (error) {
      console.error('Error al obtener los desafíos:', error);
      return [];
    }
  },

  /**
   * Gets a challenge by id
   */
  getChallengeById: async (id: string): Promise<Challenge | null> => {
    try {
      const challenges = await ChallengeService.getChallenges();
      return challenges.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Error al obtener el desafío:', error);
      return null;
    }
  }
};
