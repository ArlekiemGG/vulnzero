
// Definiciones de tipos e interfaces para máquinas
export interface MachineType {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  categories: string[];
  points: number;
  image?: string;
  osType: 'linux' | 'windows' | 'other';
  solvedBy?: number;
  userProgress?: number;
  featured?: boolean;
}

// Datos de máquina mapeados para tener IDs consistentes con los tipos de máquinas en el backend
export const machines: MachineType[] = [
  {
    id: "01", // ID que coincide con el de imagenes_disponibles en app.py
    name: "VulnNet",
    description: "Una máquina vulnerable que contiene varias debilidades en su infraestructura web. Ideal para principiantes.",
    difficulty: "easy",
    categories: ["Web", "Privilege Escalation"],
    points: 20,
    solvedBy: 1250,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=320&auto=format&fit=crop",
    osType: "linux",
    featured: true
  },
  {
    id: "02",
    name: "CryptoLocker",
    description: "Máquina enfocada en técnicas de criptografía y explotación de servicios mal configurados.",
    difficulty: "medium",
    categories: ["Crypto", "Enumeration"],
    points: 30,
    solvedBy: 842,
    userProgress: 45,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=320&auto=format&fit=crop",
    osType: "linux"
  },
  {
    id: "03",
    name: "WindowsForge",
    description: "Entorno Windows con múltiples vulnerabilidades que requieren una combinación de técnicas de explotación.",
    difficulty: "hard",
    categories: ["Windows", "Active Directory"],
    points: 40,
    solvedBy: 521,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?q=80&w=320&auto=format&fit=crop",
    osType: "windows"
  },
  {
    id: "04",
    name: "NetworkMaze",
    description: "Laberinto de redes con múltiples segmentos y servicios interconectados que requieren pivoting.",
    difficulty: "insane",
    categories: ["Network", "Pivoting"],
    points: 50,
    solvedBy: 128,
    userProgress: 20,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=320&auto=format&fit=crop",
    osType: "linux"
  },
  {
    id: "05",
    name: "WebIntrusion",
    description: "Aplicación web con numerosas vulnerabilidades desde inyecciones SQL hasta XSS avanzado.",
    difficulty: "medium",
    categories: ["Web", "API"],
    points: 35,
    solvedBy: 725,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=320&auto=format&fit=crop",
    osType: "linux"
  },
  {
    id: "06",
    name: "IoTExplorer",
    description: "Dispositivo IoT vulnerable con firmware modificable y varios servicios explotables.",
    difficulty: "hard",
    categories: ["IoT", "Firmware"],
    points: 45,
    solvedBy: 312,
    userProgress: 10,
    image: "https://images.unsplash.com/photo-1618759048449-85548f3b73b7?q=80&w=320&auto=format&fit=crop",
    osType: "other"
  }
];
