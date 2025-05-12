
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MachineCard, { MachineProps } from '@/components/machines/MachineCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Database } from 'lucide-react';

// Mock data para estadísticas de usuario
const userStats = {
  level: 7,
  points: 3450,
  pointsToNextLevel: 550,
  progress: 70,
  rank: 42,
  solvedMachines: 15,
  completedChallenges: 8,
};

// Mock data para máquinas
const machines: MachineProps[] = [
  {
    id: "machine1",
    name: "VulnNet",
    description: "Una máquina vulnerable que contiene varias debilidades en su infraestructura web. Ideal para principiantes.",
    difficulty: "easy",
    categories: ["Web", "Privilege Escalation"],
    points: 20,
    solvedBy: 1250,
    userProgress: 100,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=320&auto=format&fit=crop",
    osType: "linux",
    featured: true
  },
  {
    id: "machine2",
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
    id: "machine3",
    name: "SecureServer 2023",
    description: "Un servidor Windows con múltiples vulnerabilidades. Enfocado en técnicas de post-explotación.",
    difficulty: "hard",
    categories: ["Active Directory", "Windows"],
    points: 40,
    solvedBy: 356,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=320&auto=format&fit=crop",
    osType: "windows"
  },
  {
    id: "machine4",
    name: "WebIntrusion",
    description: "Explora vulnerabilidades web comunes como XSS, CSRF y SQL Injection en esta aplicación web vulnerable.",
    difficulty: "easy",
    categories: ["Web", "Injection"],
    points: 25,
    solvedBy: 978,
    userProgress: 100,
    image: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=320&auto=format&fit=crop",
    osType: "linux"
  },
  {
    id: "machine5",
    name: "NetworkBreaker",
    description: "Enfocada en explotación de servicios de red y vulnerabilidades en sistemas de autenticación.",
    difficulty: "medium",
    categories: ["Network", "Authentication"],
    points: 35,
    solvedBy: 624,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1558346547-4439467bd1d5?q=80&w=320&auto=format&fit=crop",
    osType: "linux"
  },
  {
    id: "machine6",
    name: "BufferBreaker",
    description: "Práctica técnicas de explotación de memoria y buffer overflows en entornos controlados.",
    difficulty: "hard",
    categories: ["Binary Exploitation", "Buffer Overflow"],
    points: 45,
    solvedBy: 213,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=320&auto=format&fit=crop",
    osType: "linux"
  },
  {
    id: "machine7",
    name: "ActiveHacker",
    description: "Laboratorio de Active Directory con múltiples vectores de ataque y técnicas de enumeración.",
    difficulty: "medium",
    categories: ["Active Directory", "Windows"],
    points: 35,
    solvedBy: 546,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=320&auto=format&fit=crop",
    osType: "windows"
  },
  {
    id: "machine8",
    name: "KernelExploit",
    description: "Explota vulnerabilidades en el kernel de Linux para escalar privilegios y comprometer el sistema.",
    difficulty: "insane",
    categories: ["Kernel", "Privilege Escalation"],
    points: 50,
    solvedBy: 124,
    userProgress: 0,
    image: "https://images.unsplash.com/photo-1618044619888-009e412ff12a?q=80&w=320&auto=format&fit=crop",
    osType: "linux",
    featured: true
  }
];

const Machines = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOS, setSelectedOS] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  
  // Filtro de máquinas
  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          machine.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          machine.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesOS = selectedOS === 'all' || machine.osType === selectedOS;
    const matchesDifficulty = selectedDifficulty === 'all' || machine.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesOS && matchesDifficulty;
  });

  const getCompletedMachines = () => filteredMachines.filter(m => m.userProgress === 100);
  const getInProgressMachines = () => filteredMachines.filter(m => m.userProgress > 0 && m.userProgress < 100);
  const getPendingMachines = () => filteredMachines.filter(m => m.userProgress === 0);

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                Máquinas Vulnerables
              </h1>
              <p className="text-gray-400">
                Explora y resuelve máquinas vulnerables para mejorar tus habilidades
              </p>
            </header>

            {/* Filtros */}
            <div className="bg-cybersec-darkgray p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Buscar por nombre, descripción o categoría..." 
                    className="bg-cybersec-black pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-3">
                  <Select value={selectedOS} onValueChange={setSelectedOS}>
                    <SelectTrigger className="bg-cybersec-black">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Sistema Operativo" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-cybersec-darkgray border-cybersec-darkgray">
                      <SelectItem value="all">Todos los sistemas</SelectItem>
                      <SelectItem value="linux">Linux</SelectItem>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="other">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-3">
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="bg-cybersec-black">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Dificultad" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-cybersec-darkgray border-cybersec-darkgray">
                      <SelectItem value="all">Todas las dificultades</SelectItem>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                      <SelectItem value="insane">Insano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-1">
                  <Button 
                    variant="outline" 
                    className="w-full border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-cybersec-black"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedOS('all');
                      setSelectedDifficulty('all');
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline" className="bg-transparent border-cybersec-electricblue text-cybersec-electricblue">
                  Linux: {machines.filter(m => m.osType === 'linux').length}
                </Badge>
                <Badge variant="outline" className="bg-transparent border-cybersec-electricblue text-cybersec-electricblue">
                  Windows: {machines.filter(m => m.osType === 'windows').length}
                </Badge>
                <Badge variant="outline" className="bg-transparent border-green-500 text-green-500">
                  Fácil: {machines.filter(m => m.difficulty === 'easy').length}
                </Badge>
                <Badge variant="outline" className="bg-transparent border-yellow-500 text-yellow-500">
                  Media: {machines.filter(m => m.difficulty === 'medium').length}
                </Badge>
                <Badge variant="outline" className="bg-transparent border-red-500 text-red-500">
                  Difícil: {machines.filter(m => m.difficulty === 'hard').length}
                </Badge>
                <Badge variant="outline" className="bg-transparent border-purple-500 text-purple-500">
                  Insano: {machines.filter(m => m.difficulty === 'insane').length}
                </Badge>
              </div>
            </div>

            {/* Máquinas */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-cybersec-darkgray mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Todas ({filteredMachines.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Completadas ({getCompletedMachines().length})
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  En Progreso ({getInProgressMachines().length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen">
                  Pendientes ({getPendingMachines().length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {filteredMachines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMachines.map((machine) => (
                      <MachineCard key={machine.id} {...machine} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-cybersec-darkgray rounded-lg">
                    <p className="text-gray-400">No se encontraron máquinas con los filtros seleccionados</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                {getCompletedMachines().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getCompletedMachines().map((machine) => (
                      <MachineCard key={machine.id} {...machine} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-cybersec-darkgray rounded-lg">
                    <p className="text-gray-400">No has completado ninguna máquina con los filtros seleccionados</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="in_progress" className="mt-0">
                {getInProgressMachines().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getInProgressMachines().map((machine) => (
                      <MachineCard key={machine.id} {...machine} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-cybersec-darkgray rounded-lg">
                    <p className="text-gray-400">No tienes máquinas en progreso con los filtros seleccionados</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                {getPendingMachines().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getPendingMachines().map((machine) => (
                      <MachineCard key={machine.id} {...machine} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-cybersec-darkgray rounded-lg">
                    <p className="text-gray-400">No tienes máquinas pendientes con los filtros seleccionados</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Machines;
