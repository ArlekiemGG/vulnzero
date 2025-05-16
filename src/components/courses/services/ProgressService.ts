
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  CourseProgressItem, 
  LessonProgressItem 
} from '@/services/course-progress/types';

export function useProgressService() {
  const { user: userSession } = useAuth();

  const getLessonProgress = async (lessonId: string): Promise<LessonProgressItem | null> => {
    if (!userSession) {
      console.log('No user session found, cannot get lesson progress');
      return null;
    }

    try {
      console.log(`Getting lesson progress for ${lessonId} and user ${userSession.id}`);
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userSession.id)
        .eq('lesson_id', lessonId)
        .single();

      if (error) {
        console.error('Error fetching lesson progress:', error);
        return null;
      }

      console.log(`Lesson progress for ${lessonId}:`, data);
      return data || null;
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      return null;
    }
  };

  const getCourseProgress = async (courseId: string): Promise<CourseProgressItem | null> => {
    if (!userSession) {
      console.log('No user session found, cannot get course progress');
      return null;
    }

    try {
      console.log(`Getting course progress for ${courseId} and user ${userSession.id}`);
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userSession.id)
        .eq('course_id', courseId)
        .single();

      if (error) {
        console.error('Error fetching course progress:', error);
        return null;
      }

      console.log(`Course progress for ${courseId}:`, data);
      return data || null;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return null;
    }
  };

  const markLessonAsCompleted = async (lessonId: string, courseId?: string) => {
    if (!userSession) {
      toast({
        title: "No autorizado",
        description: "Debes iniciar sesión para marcar la lección como completada.",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log(`Marking lesson ${lessonId} as completed for user ${userSession.id}`);
      
      // First, check if the lesson is already marked as completed
      const existingProgress = await getLessonProgress(lessonId);

      if (existingProgress && existingProgress.completed) {
        // If the lesson is already completed, do nothing
        console.log(`Lesson ${lessonId} is already completed`);
        toast({
          title: "Lección ya completada",
          description: "Esta lección ya ha sido marcada como completada.",
        });
        return true;
      }

      // Obtener el course_id si no fue proporcionado
      let effectiveCourseId = courseId;
      if (!effectiveCourseId) {
        // Intentar determinar el curso de la lección
        try {
          const { data: lessonData } = await supabase
            .from('course_lessons')
            .select('section_id')
            .eq('id', lessonId)
            .single();

          if (lessonData?.section_id) {
            const { data: sectionData } = await supabase
              .from('course_sections')
              .select('course_id')
              .eq('id', lessonData.section_id)
              .single();
              
            effectiveCourseId = sectionData?.course_id;
          }
        } catch (err) {
          console.error('Error getting course_id for lesson:', err);
        }
      }

      if (!effectiveCourseId) {
        console.error('Could not determine course_id for lesson:', lessonId);
        toast({
          title: "Error",
          description: "No se pudo determinar el curso de la lección.",
          variant: "destructive",
        });
        return false;
      }

      console.log(`Using course_id ${effectiveCourseId} for lesson ${lessonId}`);

      // If the lesson is not completed, update or insert the progress
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert(
          {
            user_id: userSession.id,
            lesson_id: lessonId,
            course_id: effectiveCourseId,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' }
        )
        .select();

      if (error) {
        console.error('Error marking lesson as completed:', error);
        toast({
          title: "Error",
          description: "No se pudo marcar la lección como completada.",
          variant: "destructive",
        });
        return false;
      }

      // After successfully marking the lesson as completed, update course progress
      await updateCourseProgress(effectiveCourseId);

      toast({
        title: "Lección completada",
        description: "¡Has completado esta lección!",
      });
      return true;
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al marcar la lección como completada.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCourseProgress = async (courseId: string) => {
    if (!userSession) {
      return;
    }

    try {
      console.log(`Updating course progress for ${courseId} and user ${userSession.id}`);
      
      // Fetch all lessons for the course
      const { data: lessons, error: lessonsError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userSession.id)
        .eq('course_id', courseId);

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        return;
      }

      // Get total lessons in course
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', courseId);
        
      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        return;
      }
      
      let totalLessons = 0;
      
      if (sections && sections.length > 0) {
        // Contar lecciones de cada sección
        for (const section of sections) {
          const { count, error: countError } = await supabase
            .from('course_lessons')
            .select('*', { count: 'exact' })
            .eq('section_id', section.id);
            
          if (countError) {
            console.error('Error counting lessons:', countError);
          } else {
            totalLessons += count || 0;
          }
        }
      }

      // Calculate progress
      const completedLessons = lessons?.filter((lesson) => lesson.completed).length || 0;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const isCompleted = progressPercentage === 100;

      console.log(`Progress: ${completedLessons}/${totalLessons} = ${progressPercentage}%`);

      // Update course progress in database
      const { data, error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: userSession.id,
          course_id: courseId,
          progress_percentage: progressPercentage,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          started_at: new Date().toISOString() // Añadimos la fecha de inicio
        })
        .select();

      if (error) {
        console.error('Error updating course progress:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el progreso del curso.",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        const courseProgress = data[0] as CourseProgressItem;
        console.log(`Course ${courseId} progress updated to ${courseProgress.progress_percentage}%`);
      }
    } catch (error) {
      console.error('Error updating course progress:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el progreso del curso.",
        variant: "destructive",
      });
    }
  };

  return {
    getLessonProgress,
    markLessonAsCompleted,
    updateCourseProgress,
    getCourseProgress,
  };
}
