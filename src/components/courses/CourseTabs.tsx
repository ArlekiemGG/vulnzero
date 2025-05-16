
import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseGrid from './CourseGrid';
import { CourseService, Course } from './services/CourseService';
import { Skeleton } from '@/components/ui/skeleton';
import courseCatalog from '@/data/courses';

interface CourseTabsProps {
  searchTerm?: string;
}

const CourseTabs: React.FC<CourseTabsProps> = ({ searchTerm = '' }) => {
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [courses, setCourses] = useState<Course[]>([]);
  const [beginnerCourses, setBeginnerCourses] = useState<Course[]>([]);
  const [intermediateCourses, setIntermediateCourses] = useState<Course[]>([]);
  const [advancedCourses, setAdvancedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      
      try {
        // Intentamos cargar desde la API
        const apiCourses = await CourseService.getCourses();
        
        // Si no hay datos desde la API, usamos los datos estáticos
        const allCourses = apiCourses.length > 0 ? apiCourses : courseCatalog.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          image_url: course.image_url,
          level: course.level.toLowerCase(),
          category: course.category,
          instructor: course.instructor,
          duration_minutes: course.duration_minutes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        setCourses(allCourses);
        
        // Filtrar cursos por nivel
        setBeginnerCourses(allCourses.filter(course => 
          course.level === 'principiante' || course.level === 'básico'));
        setIntermediateCourses(allCourses.filter(course => 
          course.level === 'intermedio'));
        setAdvancedCourses(allCourses.filter(course => 
          course.level === 'avanzado'));

        console.log('Cargados cursos:', allCourses.length);
      } catch (error) {
        console.error('Error fetching courses:', error);
        
        // En caso de error, usamos los datos estáticos como respaldo
        const staticCourses = courseCatalog.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          image_url: course.image_url,
          level: course.level.toLowerCase(),
          category: course.category,
          instructor: course.instructor,
          duration_minutes: course.duration_minutes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        setCourses(staticCourses);
        setBeginnerCourses(staticCourses.filter(course => 
          course.level === 'principiante' || course.level === 'básico'));
        setIntermediateCourses(staticCourses.filter(course => 
          course.level === 'intermedio'));
        setAdvancedCourses(staticCourses.filter(course => 
          course.level === 'avanzado'));
        
        console.log('Cargados cursos estáticos de respaldo:', staticCourses.length);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  // Filtramos los cursos basados en el término de búsqueda
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return { 
      all: courses, 
      beginner: beginnerCourses, 
      intermediate: intermediateCourses, 
      advanced: advancedCourses 
    };

    const term = searchTerm.toLowerCase().trim();
    
    const filterBySearchTerm = (courseList: Course[]) => {
      return courseList.filter(course => 
        course.title.toLowerCase().includes(term) || 
        course.description.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term) ||
        course.instructor.toLowerCase().includes(term)
      );
    };

    return {
      all: filterBySearchTerm(courses),
      beginner: filterBySearchTerm(beginnerCourses),
      intermediate: filterBySearchTerm(intermediateCourses),
      advanced: filterBySearchTerm(advancedCourses)
    };
  }, [courses, beginnerCourses, intermediateCourses, advancedCourses, searchTerm]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderSkeletons = () => {
    return Array(8).fill(0).map((_, index) => (
      <div key={index} className="flex flex-col h-[350px] rounded-lg overflow-hidden">
        <Skeleton className="h-40 w-full" />
        <div className="p-4 space-y-2 flex-grow">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex justify-between pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full mt-4" />
        </div>
      </div>
    ));
  };

  return (
    <Tabs defaultValue="todos" value={activeTab} onValueChange={handleTabChange} className="mb-8">
      <div className="flex justify-center mb-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="todos">Todos los cursos</TabsTrigger>
          <TabsTrigger value="principiante">Principiante</TabsTrigger>
          <TabsTrigger value="intermedio">Intermedio</TabsTrigger>
          <TabsTrigger value="avanzado">Avanzado</TabsTrigger>
        </TabsList>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {renderSkeletons()}
        </div>
      ) : (
        <>
          <TabsContent value="todos">
            {filteredCourses.all.length > 0 ? (
              <CourseGrid courses={filteredCourses.all} />
            ) : (
              <p className="text-center py-8 text-gray-500">
                {searchTerm ? "No se encontraron cursos que coincidan con tu búsqueda" : "No hay cursos disponibles"}
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="principiante">
            {filteredCourses.beginner.length > 0 ? (
              <CourseGrid courses={filteredCourses.beginner} />
            ) : (
              <p className="text-center py-8 text-gray-500">
                {searchTerm ? "No se encontraron cursos de nivel principiante que coincidan con tu búsqueda" : "No hay cursos de nivel principiante disponibles"}
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="intermedio">
            {filteredCourses.intermediate.length > 0 ? (
              <CourseGrid courses={filteredCourses.intermediate} />
            ) : (
              <p className="text-center py-8 text-gray-500">
                {searchTerm ? "No se encontraron cursos de nivel intermedio que coincidan con tu búsqueda" : "No hay cursos de nivel intermedio disponibles"}
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="avanzado">
            {filteredCourses.advanced.length > 0 ? (
              <CourseGrid courses={filteredCourses.advanced} />
            ) : (
              <p className="text-center py-8 text-gray-500">
                {searchTerm ? "No se encontraron cursos de nivel avanzado que coincidan con tu búsqueda" : "No hay cursos de nivel avanzado disponibles"}
              </p>
            )}
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};

export default CourseTabs;
