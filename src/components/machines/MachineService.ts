
import { machines } from './MachineData';
import { MachineDetails } from './types/MachineTypes';
import FlagService from './services/FlagService';
import TaskHintService from './services/TaskHintService';
import ActivityLogService from './services/ActivityLogService';
import ProgressService from './services/ProgressService';

// Use "export type" for type re-exports when isolatedModules is enabled
export type { MachineDetails } from './types/MachineTypes';
export type { MachineProgress } from './types/MachineTypes';

export const MachineService = {
  // Get all available machines
  getAllMachines: () => {
    return machines;
  },

  // Get a specific machine by ID
  getMachine: (id: string): MachineDetails | null => {
    // Enhanced debugging
    console.log("getMachine called with ID:", id);
    
    // Verify that the ID is not null or undefined
    if (!id) {
      console.error("Machine ID not provided");
      return null;
    }
    
    // Make sure ID is a string and in the correct format
    const machineId = String(id).trim();
    console.log("Looking for machine with ID:", machineId);
    console.log("Available machine IDs:", machines.map(m => m.id));
    
    // Find the machine using direct string comparison - no coercion
    const machine = machines.find(machine => machine.id === machineId);
    
    if (!machine) {
      console.error(`Machine with ID ${machineId} not found`);
      return null;
    }
    
    console.log("Machine found:", machine.name);
    
    // Add additional details that might be needed for the machine detail page
    return {
      ...machine,
      solvedBy: machine.solvedBy || 0, // Ensure solvedBy has a default value
      userProgress: machine.userProgress || 0, // Ensure userProgress has a default value
      image: machine.image || "/placeholder.svg", // Ensure image has a default value
      ipAddress: '10.10.10.' + Math.floor(Math.random() * 254 + 1),
      creator: 'VulnZero Team',
      releaseDate: '2025-01-15',
      requirements: [
        'Conexión VPN activa',
        'Kali Linux o similar',
        'Conocimientos básicos de enumeración'
      ],
      skills: [
        'Enumeración de servicios',
        'Explotación de vulnerabilidades web',
        'Escalada de privilegios en Linux'
      ],
      tasks: [
        { id: 1, name: 'Enumerar servicios', description: 'Identifica los servicios disponibles en la máquina', completed: false },
        { id: 2, name: 'Conseguir shell', description: 'Obtén acceso al sistema mediante una shell', completed: false },
        { id: 3, name: 'Capturar flag de usuario', description: 'Encuentra y envía la flag de usuario', completed: false },
        { id: 4, name: 'Escalar privilegios', description: 'Eleva tus privilegios a root/administrador', completed: false },
        { id: 5, name: 'Capturar flag de root', description: 'Encuentra y envía la flag de root', completed: false }
      ],
      hints: [
        { id: 1, title: 'Pista de enumeración', content: 'Busca servicios HTTP y SSH. Revisa cuidadosamente las versiones.', locked: true },
        { id: 2, title: 'Pista de acceso inicial', content: 'El servidor web tiene un directorio oculto con un panel de admin mal configurado.', locked: true },
        { id: 3, title: 'Pista de escalada', content: 'Hay un archivo SUID configurado incorrectamente que puede ser explotado.', locked: true }
      ]
    };
  },

  // Get user progress for a specific machine
  getUserMachineProgress: ProgressService.getUserMachineProgress,

  // Submit a flag for a machine
  submitFlag: FlagService.submitFlag,

  // Complete a specific task in a machine
  completeTask: TaskHintService.completeTask,
  
  // Log activity related to machine usage
  logMachineActivity: ActivityLogService.logMachineActivity,
  
  // Unlock a hint for a machine
  unlockHint: TaskHintService.unlockHint
};

export default MachineService;
