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
      return null;
    }

    try {
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

      return data || null;
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      return null;
    }
  };

  const markLessonAsCompleted = async (lessonId: string) => {
    if (!userSession) {
      toast({
        title: "No autorizado",
        description: "Debes iniciar sesión para marcar la lección como completada.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // First, check if the lesson is already marked as completed
      const existingProgress = await getLessonProgress(lessonId);

      if (existingProgress && existingProgress.completed) {
        // If the lesson is already completed, do nothing
        toast({
          title: "Lección ya completada",
          description: "Esta lección ya ha sido marcada como completada.",
        });
        return true;
      }

      // If the lesson is not completed, update or insert the progress
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert(
          {
            user_id: userSession.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: ['user_id', 'lesson_id'] }
        )
        .select()

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
      if (data && data.length > 0) {
        const lesson = data[0] as LessonProgressItem;
        await updateCourseProgress(lesson.course_id);
      }

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
      // Fetch all lessons for the course
      const { data: lessons, error: lessonsError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userSession.id)
        .like('lesson_id', `${courseId}%`); // Filter lessons by course ID

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        return;
      }

      // Calculate progress
      const totalLessons = lessons?.length || 0;
      const completedLessons = lessons?.filter((lesson) => lesson.completed).length || 0;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const isCompleted = progressPercentage === 100;

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
  };
}
