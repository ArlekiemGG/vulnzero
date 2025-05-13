
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Database, Terminal, Code, Server, Monitor, Clock, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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

// Mock data para laboratorios
const labs = [
  {
    id: 1,
    name: 'Entorno Kali Linux',
    description: 'Laboratorio con Kali Linux completamente configurado con herramientas de pentesting.',
    category: 'Pentesting',
    level: 'Principiante',
    status: 'ready', // ready, busy, offline
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=320&auto=format&fit=crop',
    tags: ['kali', 'penetration testing', 'hacking tools'],
    activeInstances: 89,
    lastUsed: '2023-06-01'
  },
  {
    id: 2,
    name: 'Laboratorio de Redes Vulnerables',
    description: 'Entorno controlado con múltiples máquinas vulnerables interconectadas para practicar ataques de red.',
    category: 'Red',
    level: 'Intermedio',
    status: 'ready',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=320&auto=format&fit=crop',
    tags: ['network', 'vulnerabilities', 'metasploit'],
    activeInstances: 62,
    lastUsed: '2023-05-28'
  },
  {
    id: 3,
    name: 'Análisis Forense Digital',
    description: 'Laboratorio equipado con herramientas para análisis forense de discos, memoria y red.',
    category: 'Forense',
    level: 'Avanzado',
    status: 'busy',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=320&auto=format&fit=crop',
    tags: ['forensic', 'memory analysis', 'disk forensics'],
    activeInstances: 45,
    lastUsed: '2023-05-15'
  },
  {
    id: 4,
    name: 'Web App Pentesting',
    description: 'Entorno con aplicaciones web vulnerables para practicar técnicas de hacking web.',
    category: 'Web',
    level: 'Intermedio',
    status: 'ready',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=320&auto=format&fit=crop',
    tags: ['web', 'OWASP', 'SQL injection'],
    activeInstances: 103,
    lastUsed: '2023-06-02'
  },
  {
    id: 5,
    name: 'Criptografía Aplicada',
    description: 'Laboratorio para practicar implementación y análisis de algoritmos criptográficos.',
    category: 'Criptografía',
    level: 'Avanzado',
    status: 'ready',
    image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=320&auto=format&fit=crop',
    tags: ['cryptography', 'encryption', 'hash analysis'],
    activeInstances: 38,
    lastUsed: '2023-05-20'
  },
  {
    id: 6,
    name: 'Entorno de ICS/SCADA',
    description: 'Simulación de sistemas industriales para estudiar vulnerabilidades en entornos OT.',
    category: 'Industrial',
    level: 'Experto',
    status: 'offline',
    image: 'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?q=80&w=320&auto=format&fit=crop',
    tags: ['ICS', 'SCADA', 'industrial'],
    activeInstances: 0,
    lastUsed: '2023-04-15'
  },
  {
    id: 7,
    name: 'Malware Analysis Lab',
    description: 'Entorno aislado y seguro para analizar malware sin riesgo de infección.',
    category: 'Malware',
    level: 'Avanzado',
    status: 'ready',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=320&auto=format&fit=crop',
    tags: ['malware', 'reverse engineering', 'sandbox'],
    activeInstances: 51,
    lastUsed: '2023-05-30'
  },
  {
    id: 8,
    name: 'Mobile Security Lab',
    description: 'Laboratorio para analizar seguridad en aplicaciones Android e iOS.',
    category: 'Mobile',
    level: 'Intermedio',
    status: 'ready',
    image: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?q=80&w=320&auto=format&fit=crop',
    tags: ['mobile', 'android', 'ios'],
    activeInstances: 42,
    lastUsed: '2023-05-25'
  }
];

// Mock data de instancias activas del usuario
const userInstances = [
  {
    id: 'inst-1',
    labId: 2,
    name: 'Red Vulnerable-01',
    startedAt: '2023-06-02T15:30:00',
    expiresAt: '2023-06-02T18:30:00',
    status: 'running',
    progress: 35,
    ipAddress: '10.0.12.45'
  },
  {
    id: 'inst-2',
    labId: 4,
    name: 'WebApp-08',
    startedAt: '2023-06-01T09:15:00',
    expiresAt: '2023-06-01T12:15:00',
    status: 'completed',
    progress: 100,
    ipAddress: '10.0.8.22'
  }
];

// Definir categorías y niveles
const categories = [...new Set(labs.map(lab => lab.category))];
const levels = ['Principiante', 'Intermedio', 'Avanzado', 'Experto'];

const Labs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Filtra los laboratorios según los criterios seleccionados
  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lab.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory ? lab.category === selectedCategory : true;
    const matchesLevel = selectedLevel ? lab.level === selectedLevel : true;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelBadgeColor = (level) => {
    switch(level) {
      case 'Principiante': return 'bg-green-500/20 text-green-500 border-green-500';
      case 'Intermedio': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
      case 'Avanzado': return 'bg-orange-500/20 text-orange-500 border-orange-500';
      case 'Experto': return 'bg-red-500/20 text-red-500 border-red-500';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ready': return 'bg-green-500 text-green-500';
      case 'busy': return 'bg-yellow-500 text-yellow-500';
      case 'offline': return 'bg-gray-500 text-gray-500';
      default: return 'bg-gray-500 text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'ready': return 'Disponible';
      case 'busy': return 'Ocupado';
      case 'offline': return 'Fuera de línea';
      default: return 'Desconocido';
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires - now;
    if (diffMs <= 0) return 'Expirado';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  const getInstanceStatusColor = (status) => {
    switch(status) {
      case 'running': return 'bg-green-500/20 text-green-500 border-green-500';
      case 'completed': return 'bg-blue-500/20 text-blue-500 border-blue-500';
      case 'failed': return 'bg-red-500/20 text-red-500 border-red-500';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-cybersec-neongreen mb-2">
                Laboratorios
              </h1>
              <p className="text-gray-400 mb-6">
                Entornos virtuales para practicar técnicas y herramientas de ciberseguridad
              </p>
              
              {/* Filtros de búsqueda */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Buscar laboratorios..." 
                    className="pl-10 bg-cybersec-darkgray border-cybersec-darkgray"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px] bg-cybersec-darkgray border-cybersec-darkgray">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-cybersec-darkgray border-cybersec-darkgray">
                      <SelectItem value="">Todas</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="w-[180px] bg-cybersec-darkgray border-cybersec-darkgray">
                      <SelectValue placeholder="Nivel" />
                    </SelectTrigger>
                    <SelectContent className="bg-cybersec-darkgray border-cybersec-darkgray">
                      <SelectItem value="">Todos</SelectItem>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </header>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 bg-cybersec-darkgray">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                >
                  Todos los laboratorios
                </TabsTrigger>
                <TabsTrigger 
                  value="active" 
                  className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                >
                  Mis instancias activas
                </TabsTrigger>
              </TabsList>

              {/* Todos los laboratorios */}
              <TabsContent value="all">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLabs.map(lab => (
                    <Card key={lab.id} className="bg-cybersec-darkgray border-cybersec-darkgray hover:border-cybersec-electricblue/50 transition-all overflow-hidden flex flex-col">
                      <div className="h-40 overflow-hidden relative">
                        <img 
                          src={lab.image} 
                          alt={lab.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className={cn("border", getLevelBadgeColor(lab.level))}>
                            {lab.level}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{lab.name}</CardTitle>
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-1 ${getStatusColor(lab.status)}`}></div>
                            <span className="text-xs text-gray-400">{getStatusText(lab.status)}</span>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {lab.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 flex-grow">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary" className="bg-cybersec-black">
                            {lab.category}
                          </Badge>
                          {lab.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-cybersec-black">
                              {tag}
                            </Badge>
                          ))}
                          {lab.tags.length > 2 && (
                            <Badge variant="outline" className="bg-cybersec-black">
                              +{lab.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span>{lab.activeInstances} activos</span>
                          </div>
                          <div>
                            Último uso: {lab.lastUsed}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full bg-cybersec-electricblue text-cybersec-black hover:bg-cybersec-electricblue/80"
                          disabled={lab.status !== 'ready'}
                        >
                          {lab.status === 'ready' ? 'Iniciar laboratorio' : 
                           lab.status === 'busy' ? 'En cola' : 'No disponible'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Instancias activas */}
              <TabsContent value="active">
                {userInstances.length > 0 ? (
                  <div className="space-y-6">
                    {userInstances.map(instance => {
                      const lab = labs.find(l => l.id === instance.labId);
                      return (
                        <Card key={instance.id} className="bg-cybersec-darkgray border-cybersec-darkgray">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg text-cybersec-electricblue">
                                  {instance.name}
                                </CardTitle>
                                <CardDescription>
                                  {lab?.name} - {lab?.category}
                                </CardDescription>
                              </div>
                              <Badge className={cn("border", getInstanceStatusColor(instance.status))}>
                                {instance.status === 'running' ? 'En ejecución' : 
                                 instance.status === 'completed' ? 'Completado' : instance.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-cybersec-black p-3 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Tiempo restante</div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-cybersec-electricblue" />
                                  <span className="font-mono">
                                    {instance.status === 'running' 
                                      ? formatTimeRemaining(instance.expiresAt)
                                      : 'Finalizado'}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-cybersec-black p-3 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Dirección IP</div>
                                <div className="flex items-center">
                                  <Server className="h-4 w-4 mr-2 text-cybersec-electricblue" />
                                  <span className="font-mono">{instance.ipAddress}</span>
                                </div>
                              </div>
                              <div className="bg-cybersec-black p-3 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Progreso</div>
                                <div className="flex items-center">
                                  <Progress value={instance.progress} className="h-2 flex-grow mr-2" />
                                  <span>{instance.progress}%</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                              <div className="text-sm text-gray-400">
                                Iniciado: {new Date(instance.startedAt).toLocaleString()}
                              </div>
                              <div className="flex gap-3">
                                <Button 
                                  variant="outline" 
                                  className="border-cybersec-electricblue text-cybersec-electricblue"
                                  disabled={instance.status !== 'running'}
                                >
                                  <Terminal className="h-4 w-4 mr-2" />
                                  Consola
                                </Button>
                                <Button 
                                  className="bg-cybersec-electricblue text-cybersec-black hover:bg-cybersec-electricblue/80"
                                  disabled={instance.status !== 'running'}
                                >
                                  <Monitor className="h-4 w-4 mr-2" />
                                  Acceder
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="bg-cybersec-darkgray border-cybersec-darkgray text-center py-12">
                    <CardContent>
                      <div className="flex flex-col items-center">
                        <Database className="h-12 w-12 text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay instancias activas</h3>
                        <p className="text-gray-400 mb-4">Inicia un laboratorio para comenzar a practicar</p>
                        <Button className="bg-cybersec-electricblue text-cybersec-black hover:bg-cybersec-electricblue/80">
                          Explorar laboratorios
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-8">
              <Card className="bg-cybersec-darkgray border-cybersec-darkgray">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-cybersec-neongreen" />
                    <CardTitle className="text-cybersec-neongreen">Uso de laboratorios</CardTitle>
                  </div>
                  <CardDescription>
                    Información sobre cómo utilizar efectivamente los laboratorios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-cybersec-black p-4 rounded-lg">
                      <h3 className="text-cybersec-electricblue font-medium mb-2">1. Inicia un laboratorio</h3>
                      <p className="text-sm text-gray-400">
                        Selecciona el entorno que necesites y haz clic en "Iniciar laboratorio" para crear una instancia.
                      </p>
                    </div>
                    <div className="bg-cybersec-black p-4 rounded-lg">
                      <h3 className="text-cybersec-electricblue font-medium mb-2">2. Conéctate</h3>
                      <p className="text-sm text-gray-400">
                        Utiliza la dirección IP proporcionada para conectarte vía SSH o accede a través del navegador.
                      </p>
                    </div>
                    <div className="bg-cybersec-black p-4 rounded-lg">
                      <h3 className="text-cybersec-electricblue font-medium mb-2">3. Guarda tu trabajo</h3>
                      <p className="text-sm text-gray-400">
                        Los laboratorios son temporales. Asegúrate de guardar tu trabajo antes de que finalice la sesión.
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="bg-cybersec-darkgray/50 my-4" />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-sm text-gray-400">
                      <span className="text-cybersec-neongreen">Consejo:</span> Cada instancia tiene un tiempo limitado de uso. Monitoriza el tiempo restante para no perder tu trabajo.
                    </div>
                    <Button variant="outline" className="border-cybersec-neongreen text-cybersec-neongreen whitespace-nowrap">
                      Ver guía completa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Labs;
