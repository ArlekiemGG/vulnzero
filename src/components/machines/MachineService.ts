import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MachineTask } from './MachineProgress';
import { MachineHint } from './MachineHints';

export interface MachineDetails {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  categories: string[];
  points: number;
  solvedBy: number;
  userProgress: number;
  ipAddress: string;
  creator: string;
  releaseDate: string;
  image: string;
  osType: 'windows' | 'linux' | 'other';
  requirements: string[];
  skills: string[];
  hints: MachineHint[];
  tasks: MachineTask[];
}

// Mock data for the machine details
const mockMachines: MachineDetails[] = [
  {
    id: "machine1",
    name: "VulnNet",
    description: "VulnNet es una máquina Linux diseñada para principiantes que quieren aprender sobre vulnerabilidades web comunes, enumeración de servicios y escalada de privilegios en entornos Linux. La máquina contiene múltiples vectores de ataque, permitiendo a los usuarios practicar técnicas de reconocimiento, explotación web y post-explotación.",
    difficulty: "easy",
    categories: ["Web", "Privilege Escalation", "Linux"],
    points: 20,
    solvedBy: 1250,
    userProgress: 0, // Inicializar en 0
    ipAddress: "10.10.10.15",
    creator: "VulnZero Team",
    releaseDate: "2023-08-15",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    osType: "linux",
    requirements: ["Conocimientos básicos de Linux", "Familiaridad con herramientas de reconocimiento", "Conceptos de seguridad web"],
    skills: ["Enumeración de servicios", "Explotación de vulnerabilidades web", "Escalada de privilegios"],
    hints: [
      { id: 1, title: "Enumeración inicial", content: "Comienza con un escaneo de puertos completo", locked: false },
      { id: 2, title: "Servicio web", content: "¿Has revisado todos los directorios?", locked: false },
      { id: 3, title: "Usuario inicial", content: "Las credenciales están ocultas en un archivo de configuración", locked: true },
      { id: 4, title: "Escalada de privilegios", content: "Busca tareas programadas inusuales", locked: true },
    ],
    tasks: [
      { id: 1, title: "Enumerar servicios", description: "Identifica todos los servicios ejecutándose en la máquina", completed: false },
      { id: 2, title: "Conseguir shell", description: "Obtén una shell en el sistema", completed: false },
      { id: 3, title: "Obtener flag de usuario", description: "Encuentra la flag en el directorio del usuario", completed: false },
      { id: 4, title: "Escalar privilegios", description: "Escala privilegios a root", completed: false },
      { id: 5, title: "Obtener flag de root", description: "Encuentra la flag de root", completed: false },
    ],
  },
  // Add more mock machines as needed
];

export const MachineService = {
  getMachine: (machineId: string): MachineDetails | undefined => {
    return mockMachines.find(machine => machine.id === machineId);
  },

  getUserMachineProgress: async (userId: string, machineId: string) => {
    try {
      // En una implementación real, obtendrías el progreso del usuario para esta máquina desde la base de datos
      console.log('Fetching user progress for machine:', machineId, 'user:', userId);
      
      // Simulando un retraso de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // En una implementación real, aquí consultarías una tabla en la base de datos
      // que lleve el registro de las tareas completadas por cada usuario en cada máquina
      
      // Por ahora, para simular que el usuario no ha comenzado ninguna máquina,
      // devolvemos un progreso vacío (sin tareas completadas)
      return {
        progress: 0,  // 0% de progreso inicial
        completedTasks: []  // Sin tareas completadas inicialmente
      };
    } catch (error) {
      console.error('Error fetching user machine progress:', error);
      return { progress: 0, completedTasks: [] };
    }
  },

  completeTask: async (userId: string, machineId: string, taskId: number) => {
    try {
      // En una implementación real, actualizarías la base de datos
      console.log('Completing task:', taskId, 'for machine:', machineId, 'user:', userId);
      
      // Simulando un retraso de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // En una implementación real, esto actualizaría una tabla en la base de datos
      
      return { success: true };
    } catch (error) {
      console.error('Error completing task:', error);
      return { success: false, error: 'Error al completar la tarea' };
    }
  },

  unlockHint: async (userId: string, machineId: string, hintId: number) => {
    try {
      // In a real implementation, you would update the database to unlock this hint for the user
      console.log('Unlocking hint:', hintId, 'for machine:', machineId, 'user:', userId);
      
      // In a real implementation, you would deduct points from the user's profile
      // and record this transaction in the user_activities table
      
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (error) {
      console.error('Error unlocking hint:', error);
      return { success: false, error: 'Error al desbloquear la pista' };
    }
  },

  submitFlag: async (userId: string, machineId: string, flag: string, flagType: 'user' | 'root') => {
    try {
      // In a real implementation, you would check if the submitted flag is correct
      console.log('Submitting flag for machine:', machineId, 'user:', userId, 'flagType:', flagType);
      
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the flag contains the word "flag" (just for demo purposes)
      const isCorrect = flag.toLowerCase().includes('flag');
      
      if (isCorrect) {
        // In a real implementation, you would update the user's progress and award points
        // Also record this achievement in the user_activities table
        
        return { 
          success: true, 
          message: `¡Felicidades! Has capturado la flag de ${flagType} correctamente.`,
          points: flagType === 'user' ? 10 : 20
        };
      }
      
      return { 
        success: false, 
        message: 'Flag incorrecta. Inténtalo de nuevo.'
      };
    } catch (error) {
      console.error('Error submitting flag:', error);
      return { 
        success: false, 
        message: 'Error al procesar la flag. Inténtalo más tarde.'
      };
    }
  },

  // This would log the activity and update user progress in a real implementation
  logMachineActivity: async (userId: string, machineId: string, activityType: string, points: number = 0) => {
    try {
      // In a real implementation, you would log this activity to the user_activities table
      // and update the user's progress
      console.log('Logging activity:', activityType, 'for machine:', machineId, 'user:', userId);
      
      return { success: true };
    } catch (error) {
      console.error('Error logging machine activity:', error);
      return { success: false };
    }
  }
};
