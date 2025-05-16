
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CourseCard from './CourseCard';
import { Course } from './services/CourseService';
import courseCatalog from '@/data/courses';
import { toast } from '@/components/ui/use-toast';
import { courseProgressService } from '@/services/course-progress-service';

interface CourseGridProps {
  courses: Course[];
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses }) => {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, { progress: number; completed: boolean }>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      if (courses.length === 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching progress for user ${user.id} and courses:`, courses.map(c => c.id));
        
        // Usamos el nuevo servicio unificado para obtener los datos de progreso
        const promises = courses.map(async (course) => {
          const { data, error } = await courseProgressService.getCourseProgress(user.id, course.id);
          if (error) throw error;
          return { 
            courseId: course.id, 
            progress: data?.progress_percentage || 0, 
            completed: !!data?.completed 
          };
        });
        
        const results = await Promise.all(promises);
        
        const newProgressMap: Record<string, { progress: number; completed: boolean }> = {};
        results.forEach(item => {
          newProgressMap[item.courseId] = { 
            progress: item.progress,
            completed: item.completed
          };
        });
        
        setProgressMap(newProgressMap);
      } catch (error) {
        console.error('Error fetching course progress:', error);
        if (user && !isLoading) {
          toast({
            title: "Error",
            description: "No se pudo cargar el progreso de los cursos",
            variant: "destructive"
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProgress();
  }, [user, courses]);

  // Ensure all courses have valid image URLs before rendering
  const sanitizeCourses = (courseList: Course[]): Course[] => {
    return courseList.map(course => {
      // Make sure the course has a valid ID
      if (!course.id) {
        console.error('Course is missing ID:', course);
      }
      
      return {
        ...course,
        image_url: course.image_url || `/courses/${course.id}/cover.jpg` || '/placeholder.svg'
      };
    });
  };

  // Si no hay cursos proporcionados, usamos los del catálogo estático
  const displayCourses = courses.length > 0 ? sanitizeCourses(courses) : sanitizeCourses(courseCatalog.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    image_url: course.image_url || `/courses/${course.id}/cover.jpg`,
    level: course.level.toLowerCase(),
    category: course.category,
    instructor: course.instructor,
    duration_minutes: course.duration_minutes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })));

  console.log("CourseGrid: Rendering courses:", displayCourses.map(c => `${c.id}: ${c.title} (${c.image_url})`));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayCourses.map(course => (
        <CourseCard 
          key={course.id} 
          course={course}
          progress={progressMap[course.id]?.progress || 0}
          isCompleted={progressMap[course.id]?.completed || false}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default CourseGrid;
