
// Definiciones de tipos e interfaces para máquinas
export interface MachineType {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  categories: string[];
  points: number;
  image?: string;
  osType: 'windows' | 'linux' | 'other';
}

// Datos de máquina mapeados para tener IDs consistentes con los tipos de máquinas en el backend
export const machines = [
  {
    id: "01", // ID que coincide con el de imagenes_disponibles en app.py
    name: "VulnNet",
    description: "Una máquina vulnerable que contiene varias debilidades en su infraestructura web. Ideal para principiantes.",
    difficulty: "easy" as const,
    categories: ["Web", "Privilege Escalation"],
    points: 20,
    solvedBy: 1250,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=320&auto=format&fit=crop",
    osType: "linux" as const,
    featured: true
  },
  {
    id: "02",
    name: "CryptoLocker",
    description: "Máquina enfocada en técnicas de criptografía y explotación de servicios mal configurados.",
    difficulty: "medium" as const,
    categories: ["Crypto", "Enumeration"],
    points: 30,
    solvedBy: 842,
    userProgress: 45,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=320&auto=format&fit=crop",
    osType: "linux" as const
  },
  // ... resto de máquinas
];
