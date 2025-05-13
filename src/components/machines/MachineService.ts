
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
      
      // Para una implementación real con Supabase, podríamos hacer algo como:
      /*
      const { data, error } = await supabase
        .from('machine_progress')
        .select('completed_tasks, progress')
        .eq('user_id', userId)
        .eq('machine_id', machineId)
        .single();
        
      if (error || !data) {
        return { progress: 0, completedTasks: [] };
      }
      
      return {
        progress: data.progress || 0,
        completedTasks: data.completed_tasks || []
      };
      */
      
      // Por ahora, verificamos si hay datos guardados en localStorage para simular persistencia
      const storageKey = `machine_progress_${userId}_${machineId}`;
      const savedProgress = localStorage.getItem(storageKey);
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        console.log('Loaded progress from storage:', parsed);
        return {
          progress: parsed.progress || 0,
          completedTasks: parsed.completedTasks || []
        };
      }
      
      // Si no hay datos guardados, devolvemos progreso cero
      return {
        progress: 0,
        completedTasks: []
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
      
      // Para simular persistencia, guardamos el progreso en localStorage
      const storageKey = `machine_progress_${userId}_${machineId}`;
      const savedProgress = localStorage.getItem(storageKey);
      let completedTasks: number[] = [];
      let progress = 0;
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        completedTasks = parsed.completedTasks || [];
        progress = parsed.progress || 0;
      }
      
      // Añadir la tarea si no está ya completada
      if (!completedTasks.includes(taskId)) {
        completedTasks.push(taskId);
        
        // Calcular el nuevo progreso basado en la máquina actual
        const machine = mockMachines.find(m => m.id === machineId);
        if (machine) {
          progress = Math.floor((completedTasks.length / machine.tasks.length) * 100);
        }
        
        // Guardar el progreso actualizado
        localStorage.setItem(storageKey, JSON.stringify({
          completedTasks,
          progress
        }));
        
        console.log('Updated progress:', { completedTasks, progress });
      }
      
      return { success: true, completedTasks, progress };
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
      
      // Para simular persistencia, guardamos las pistas desbloqueadas en localStorage
      const storageKey = `machine_hints_${userId}_${machineId}`;
      const savedHints = localStorage.getItem(storageKey);
      let unlockedHints: number[] = [];
      
      if (savedHints) {
        unlockedHints = JSON.parse(savedHints);
      }
      
      // Añadir la pista si no está ya desbloqueada
      if (!unlockedHints.includes(hintId)) {
        unlockedHints.push(hintId);
        localStorage.setItem(storageKey, JSON.stringify(unlockedHints));
      }
      
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
        // Actualizar las tareas completadas según el tipo de flag
        const taskId = flagType === 'user' ? 3 : 5; // Tarea 3 = flag de usuario, Tarea 5 = flag de root
        
        // Si es root flag, también marcamos la tarea 4 (escalar privilegios) como completada
        if (flagType === 'root') {
          await this.completeTask(userId, machineId, 4);
        }
        
        // Completar la tarea correspondiente a la flag
        await this.completeTask(userId, machineId, taskId);
        
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

  resetProgress: async (userId: string, machineId: string) => {
    try {
      // Eliminar el progreso guardado
      const progressKey = `machine_progress_${userId}_${machineId}`;
      const hintsKey = `machine_hints_${userId}_${machineId}`;
      
      localStorage.removeItem(progressKey);
      localStorage.removeItem(hintsKey);
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting progress:', error);
      return { success: false };
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
