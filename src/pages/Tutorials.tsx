
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Book, GraduationCap, Clock, Users, BookOpen } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

// Mock data para tutoriales
const tutorials = [
  {
    id: 1,
    title: 'Introducción a la ciberseguridad',
    description: 'Fundamentos básicos y conceptos esenciales para comenzar en el mundo de la seguridad informática.',
    category: 'Fundamentos',
    level: 'Principiante',
    duration: 45, // minutos
    completed: true,
    progress: 100,
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=320&auto=format&fit=crop',
    instructor: 'María López',
    students: 1245
  },
  {
    id: 2,
    title: 'Pentesting en aplicaciones web',
    description: 'Metodologías y herramientas para identificar vulnerabilidades en aplicaciones web modernas.',
    category: 'Web',
    level: 'Intermedio',
    duration: 120,
    completed: true,
    progress: 100,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=320&auto=format&fit=crop',
    instructor: 'Carlos Martínez',
    students: 987
  },
  {
    id: 3,
    title: 'Análisis de malware',
    description: 'Técnicas para analizar y comprender el funcionamiento de software malicioso.',
    category: 'Malware',
    level: 'Avanzado',
    duration: 180,
    completed: false,
    progress: 35,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=320&auto=format&fit=crop',
    instructor: 'Sofía Rodríguez',
    students: 723
  },
  {
    id: 4,
    title: 'Criptografía aplicada',
    description: 'Implementación práctica de algoritmos criptográficos para protección de datos.',
    category: 'Criptografía',
    level: 'Intermedio',
    duration: 90,
    completed: false,
    progress: 0,
    image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=320&auto=format&fit=crop',
    instructor: 'Alejandro Ruiz',
    students: 842
  },
  {
    id: 5,
    title: 'Seguridad en redes',
    description: 'Protección de infraestructuras de red contra ataques y configuración segura.',
    category: 'Redes',
    level: 'Intermedio',
    duration: 150,
    completed: false,
    progress: 0,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=320&auto=format&fit=crop',
    instructor: 'Elena Torres',
    students: 956
  },
  {
    id: 6,
    title: 'Hacking ético',
    description: 'Metodologías y consideraciones éticas para realizar pruebas de penetración profesionales.',
    category: 'Pentesting',
    level: 'Avanzado',
    duration: 200,
    completed: false,
    progress: 0,
    image: 'https://images.unsplash.com/photo-1633265486501-b60b6b28444a?q=80&w=320&auto=format&fit=crop',
    instructor: 'Roberto Sánchez',
    students: 1102
  },
  {
    id: 7,
    title: 'Forense digital',
    description: 'Técnicas para la recolección y análisis de evidencias digitales en investigaciones.',
    category: 'Forense',
    level: 'Intermedio',
    duration: 160,
    completed: false,
    progress: 68,
    image: 'https://images.unsplash.com/photo-1560807707-4cc0a3b6c745?q=80&w=320&auto=format&fit=crop',
    instructor: 'Patricia Gómez',
    students: 789
  },
  {
    id: 8,
    title: 'OSINT: Inteligencia de fuentes abiertas',
    description: 'Recopilación y análisis de información disponible públicamente para investigaciones.',
    category: 'OSINT',
    level: 'Principiante',
    duration: 70,
    completed: false,
    progress: 0,
    image: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?q=80&w=320&auto=format&fit=crop',
    instructor: 'Miguel Fernández',
    students: 652
  }
];

// Definir categorías para filtrado
const categories = [...new Set(tutorials.map(tutorial => tutorial.category))];
const levels = ['Principiante', 'Intermedio', 'Avanzado'];

const Tutorials = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTutorials = tutorials.filter(tutorial => 
    tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTutorialsForTab = (tab) => {
    if (tab === 'all') return filteredTutorials;
    if (tab === 'inProgress') return filteredTutorials.filter(t => t.progress > 0 && t.progress < 100);
    if (tab === 'completed') return filteredTutorials.filter(t => t.completed);
    return filteredTutorials.filter(t => t.category === tab);
  };

  const getLevelBadgeColor = (level) => {
    switch(level) {
      case 'Principiante': return 'bg-green-500/20 text-green-500 border-green-500';
      case 'Intermedio': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
      case 'Avanzado': return 'bg-red-500/20 text-red-500 border-red-500';
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
                Tutoriales
              </h1>
              <p className="text-gray-400 mb-6">
                Aprende conceptos de ciberseguridad con tutoriales interactivos
              </p>
              
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="relative w-full md:w-1/2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Buscar tutoriales..." 
                    className="pl-10 bg-cybersec-darkgray border-cybersec-darkgray"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="border-cybersec-neongreen text-cybersec-neongreen">
                    <BookOpen className="mr-2 h-4 w-4" /> Mis tutoriales
                  </Button>
                  <Button className="bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/80">
                    <GraduationCap className="mr-2 h-4 w-4" /> Ruta de aprendizaje
                  </Button>
                </div>
              </div>

              <Card className="bg-cybersec-darkgray border-cybersec-darkgray mb-6">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Book className="h-5 w-5 text-cybersec-electricblue" />
                    <CardTitle className="text-cybersec-electricblue">Tutorial destacado</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 h-52 overflow-hidden rounded-lg relative">
                      <img 
                        src={tutorials[5].image} 
                        alt={tutorials[5].title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                        <Badge className={cn("border", getLevelBadgeColor(tutorials[5].level))}>
                          {tutorials[5].level}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-cybersec-electricblue">{tutorials[5].title}</h3>
                        <p className="text-gray-400 mb-3">{tutorials[5].description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary" className="bg-cybersec-black">
                            {tutorials[5].category}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{tutorials[5].duration} min</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{tutorials[5].students} estudiantes</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button className="bg-cybersec-electricblue text-cybersec-black hover:bg-cybersec-electricblue/80">
                          Comenzar tutorial
                        </Button>
                        <Button variant="outline" className="border-cybersec-electricblue text-cybersec-electricblue">
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </header>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 bg-cybersec-darkgray">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                >
                  Todos
                </TabsTrigger>
                <TabsTrigger 
                  value="inProgress" 
                  className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                >
                  En progreso
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                >
                  Completados
                </TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Contenido para cada tab */}
              {['all', 'inProgress', 'completed', ...categories].map(tab => (
                <TabsContent key={tab} value={tab}>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {getTutorialsForTab(tab).map(tutorial => (
                      <Card key={tutorial.id} className="bg-cybersec-darkgray border-cybersec-darkgray hover:border-cybersec-electricblue/50 transition-all overflow-hidden flex flex-col">
                        <div className="h-40 overflow-hidden relative">
                          <img 
                            src={tutorial.image} 
                            alt={tutorial.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                            <Badge className={cn("border", getLevelBadgeColor(tutorial.level))}>
                              {tutorial.level}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {tutorial.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2 flex-grow">
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary" className="bg-cybersec-black">
                              {tutorial.category}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{tutorial.duration} min</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Progreso</span>
                            <span>{tutorial.progress}%</span>
                          </div>
                          <Progress value={tutorial.progress} className="h-1.5 mb-3" />
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400">
                              <span>Instructor: {tutorial.instructor}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                              <Users className="h-3.5 w-3.5 mr-1" />
                              <span>{tutorial.students}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full bg-cybersec-electricblue text-cybersec-black hover:bg-cybersec-electricblue/80"
                          >
                            {tutorial.progress > 0 && tutorial.progress < 100 
                              ? 'Continuar' 
                              : tutorial.completed 
                                ? 'Ver de nuevo' 
                                : 'Comenzar'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Tutorials;
