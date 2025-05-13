
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import CourseCard from '@/components/courses/CourseCard';
import { Course, CourseService } from '@/services/CourseService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, BookOpen, ListFilter } from 'lucide-react';
import { queries } from '@/integrations/supabase/client';
import CourseSeeder from '@/components/courses/CourseSeeder';

const Tutorials = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<(Course & { progress: number })[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    pointsToNextLevel: 0,
    progress: 0,
    rank: 0,
    solvedMachines: 0,
    completedChallenges: 0,
  });

  // Lista de categorías únicas
  const [categories, setCategories] = useState<string[]>([]);
  // Lista de niveles únicos
  const [levels, setLevels] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Asegurar que existan cursos en la base de datos
        await CourseService.ensureCoursesExist();
        
        // Obtener todos los cursos
        const allCourses = await CourseService.getCourses();
        setCourses(allCourses);

        // Si no hay cursos después de intentar sembrarlos, mostrar un mensaje
        if (allCourses.length === 0) {
          toast({
            title: "Información",
            description: "No se encontraron cursos disponibles. Por favor, contacta al administrador.",
            variant: "default",
          });
        }

        // Extraer categorías y niveles únicos
        setCategories([...new Set(allCourses.map(course => course.category))]);
        setLevels([...new Set(allCourses.map(course => course.level))]);

        if (user) {
          // Obtener el perfil del usuario para mostrar sus estadísticas reales
          const userProfile = await queries.getUserProfile(user.id);
          if (userProfile) {
            setUserStats({
              level: userProfile.level || 1,
              points: userProfile.points || 0,
              pointsToNextLevel: 100 - (userProfile.points % 100) || 0,
              progress: (userProfile.points % 100) || 0,
              rank: userProfile.rank || 0,
              solvedMachines: userProfile.solved_machines || 0,
              completedChallenges: userProfile.completed_challenges || 0,
            });
          }

          // Obtener cursos en progreso
          const inProgress = await CourseService.getInProgressCourses(user.id);
          setInProgressCourses(inProgress);

          // Obtener cursos completados
          const completed = await CourseService.getCompletedCourses(user.id);
          setCompletedCourses(completed);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los cursos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Filtrar cursos basado en los criterios de búsqueda
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Resetear filtros
  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setLevelFilter('all');
  };

  // Función para navegar a las pestañas
  const navigateToTab = (tabValue: string) => {
    const tabElement = document.querySelector(`[data-value="${tabValue}"]`) as HTMLElement;
    if (tabElement) {
      tabElement.click();
    }
  };

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userStats={userStats} />
        <main className="flex-1 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-cybersec-neongreen mb-2">Cursos y Tutoriales</h1>
              <p className="text-gray-400">Aprende ciberseguridad con nuestros cursos estructurados y detallados</p>
            </div>

            <CourseSeeder />

            <Tabs defaultValue="all" className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <TabsList className="bg-cybersec-darkgray">
                  <TabsTrigger value="all" className="data-[state=active]:bg-cybersec-black">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Todos los cursos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="in-progress" 
                    className="data-[state=active]:bg-cybersec-black"
                    disabled={!user || inProgressCourses.length === 0}
                  >
                    En progreso
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed" 
                    className="data-[state=active]:bg-cybersec-black"
                    disabled={!user || completedCourses.length === 0}
                  >
                    Completados
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="bg-cybersec-darkgray p-4 rounded-md flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar cursos..."
                      className="pl-10 bg-cybersec-black border-cybersec-gray"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:w-2/3">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="bg-cybersec-black border-cybersec-gray">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Categoría" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={levelFilter}
                    onValueChange={setLevelFilter}
                  >
                    <SelectTrigger className="bg-cybersec-black border-cybersec-gray">
                      <div className="flex items-center gap-2">
                        <ListFilter className="h-4 w-4" />
                        <SelectValue placeholder="Nivel" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los niveles</SelectItem>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    className="border-cybersec-gray text-gray-400"
                    onClick={handleResetFilters}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>

              <TabsContent value="all">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="bg-cybersec-darkgray rounded-md h-96 animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => {
                      // Buscar si el usuario tiene progreso en este curso
                      const userCourse = inProgressCourses.find(c => c.id === course.id);
                      return (
                        <CourseCard 
                          key={course.id} 
                          course={course} 
                          progress={userCourse?.progress} 
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-cybersec-darkgray rounded-md p-8 text-center">
                    <p className="text-gray-400">No se encontraron cursos que coincidan con los filtros aplicados.</p>
                    <Button 
                      variant="link" 
                      className="text-cybersec-electricblue mt-2"
                      onClick={handleResetFilters}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="in-progress">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-cybersec-darkgray rounded-md h-96 animate-pulse"></div>
                    ))}
                  </div>
                ) : inProgressCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inProgressCourses.map(course => (
                      <CourseCard 
                        key={course.id} 
                        course={course} 
                        progress={course.progress} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-cybersec-darkgray rounded-md p-8 text-center">
                    <p className="text-gray-400">No tienes cursos en progreso actualmente.</p>
                    <Button 
                      variant="link" 
                      className="text-cybersec-electricblue mt-2"
                      onClick={() => navigateToTab("all")}
                    >
                      Explorar cursos disponibles
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-cybersec-darkgray rounded-md h-96 animate-pulse"></div>
                    ))}
                  </div>
                ) : completedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedCourses.map(course => (
                      <CourseCard key={course.id} course={course} progress={100} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-cybersec-darkgray rounded-md p-8 text-center">
                    <p className="text-gray-400">No has completado ningún curso todavía.</p>
                    <Button 
                      variant="link" 
                      className="text-cybersec-electricblue mt-2"
                      onClick={() => navigateToTab("all")}
                    >
                      Explorar cursos disponibles
                    </Button>
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

export default Tutorials;
