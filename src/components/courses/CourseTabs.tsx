
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseGrid from './CourseGrid';
import { CourseService, Course } from './services/CourseService';
import { Skeleton } from '@/components/ui/skeleton';

const CourseTabs: React.FC = () => {
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
        const allCourses = await CourseService.getCourses();
        setCourses(allCourses);
        
        // Filtrar cursos por nivel
        setBeginnerCourses(allCourses.filter(course => course.level === 'principiante'));
        setIntermediateCourses(allCourses.filter(course => course.level === 'intermedio'));
        setAdvancedCourses(allCourses.filter(course => course.level === 'avanzado'));
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

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
    <Tabs defaultValue="todos" value={activeTab} onValueChange={handleTabChange}>
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
            {courses.length > 0 ? (
              <CourseGrid courses={courses} />
            ) : (
              <p className="text-center py-8 text-gray-500">No hay cursos disponibles</p>
            )}
          </TabsContent>
          
          <TabsContent value="principiante">
            {beginnerCourses.length > 0 ? (
              <CourseGrid courses={beginnerCourses} />
            ) : (
              <p className="text-center py-8 text-gray-500">No hay cursos de nivel principiante disponibles</p>
            )}
          </TabsContent>
          
          <TabsContent value="intermedio">
            {intermediateCourses.length > 0 ? (
              <CourseGrid courses={intermediateCourses} />
            ) : (
              <p className="text-center py-8 text-gray-500">No hay cursos de nivel intermedio disponibles</p>
            )}
          </TabsContent>
          
          <TabsContent value="avanzado">
            {advancedCourses.length > 0 ? (
              <CourseGrid courses={advancedCourses} />
            ) : (
              <p className="text-center py-8 text-gray-500">No hay cursos de nivel avanzado disponibles</p>
            )}
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};

export default CourseTabs;
