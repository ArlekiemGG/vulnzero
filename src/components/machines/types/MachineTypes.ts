
// Interface for machine progress information
export interface MachineProgress {
  machineId: string;
  userId: string;
  progress: number;
  flags: string[];
  startedAt?: string;
  lastActivityAt?: string;
  completedAt?: string;
  completedTasks?: number[];
}

// Interface for extended machine details
export interface MachineDetails {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  categories: string[];
  points: number;
  solvedBy: number;
  userProgress: number;
  image: string;
  osType: 'linux' | 'windows' | 'other';
  featured?: boolean;
  ipAddress?: string;
  creator?: string;
  releaseDate?: string;
  requirements?: string[];
  skills?: string[];
  tasks?: Array<{
    id: number;
    name: string;
    description: string;
    completed: boolean;
  }>;
  hints?: Array<{
    id: number;
    title: string;
    content: string;
    locked: boolean;
  }>;
}
