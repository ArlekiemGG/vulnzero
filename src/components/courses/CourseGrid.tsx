
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CourseCard from './CourseCard';
import { Course } from './services/CourseService';
import courseCatalog from '@/data/courses';
import { toast } from '@/components/ui/use-toast';

interface CourseGridProps {
  courses: Course[];
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses }) => {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, { progress: number; completed: boolean }>>({});

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || courses.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('user_course_progress')
          .select('course_id, progress_percentage, completed')
          .eq('user_id', user.id)
          .in('course_id', courses.map(course => course.id));
        
        if (error) throw error;
        
        const newProgressMap: Record<string, { progress: number; completed: boolean }> = {};
        data?.forEach(item => {
          newProgressMap[item.course_id] = { 
            progress: item.progress_percentage,
            completed: item.completed
          };
        });
        
        setProgressMap(newProgressMap);
      } catch (error) {
        console.error('Error fetching course progress:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el progreso de los cursos",
          variant: "destructive"
        });
      }
    };
    
    fetchProgress();
  }, [user, courses]);

  // Ensure all courses have valid image URLs before rendering
  const sanitizeCourses = (courseList: Course[]): Course[] => {
    return courseList.map(course => ({
      ...course,
      image_url: course.image_url || `/courses/${course.id}/cover.jpg` || '/placeholder.svg'
    }));
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
        />
      ))}
    </div>
  );
};

export default CourseGrid;
