
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CourseCard from './CourseCard';
import { Course } from './services/CourseService';

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
      }
    };
    
    fetchProgress();
  }, [user, courses]);

  console.log("CourseGrid: Rendering courses:", courses.map(c => `${c.id}: ${c.title}`));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map(course => (
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
