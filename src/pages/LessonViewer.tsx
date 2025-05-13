
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import CourseSidebar from '@/components/courses/CourseSidebar';
import LessonContent from '@/components/courses/LessonContent';
import { CourseService, CourseSection, CourseLesson, LessonProgress } from '@/services/CourseService';

const LessonViewer = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [sectionLessons, setSectionLessons] = useState<Record<string, CourseLesson[]>>({});
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [nextLessonId, setNextLessonId] = useState<string | undefined>(undefined);
  const [prevLessonId, setPrevLessonId] = useState<string | undefined>(undefined);
  
  // Cargar datos de la lección y del curso
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !lessonId || !user) {
        navigate('/tutorials');
        return;
      }
      
      setLoading(true);
      try {
        // Obtener la lección actual
        const lessonData = await CourseService.getLessonById(lessonId);
        if (!lessonData) throw new Error("Lección no encontrada");
        setLesson(lessonData);
        
        // Obtener el progreso de esta lección
        const progress = await CourseService.getLessonProgress(user.id, lessonId);
        setIsCompleted(!!progress?.completed);
        
        // Obtener todas las secciones del curso
        const sectionsData = await CourseService.getCourseSections(courseId);
        setSections(sectionsData);
        
        // Obtener todas las lecciones de cada sección
        const lessonsMap: Record<string, CourseLesson[]> = {};
        const progressMap: Record<string, LessonProgress> = {};
        
        // Para encontrar la lección previa y siguiente
        let foundCurrent = false;
        let prevLesson: CourseLesson | null = null;
        let nextLesson: CourseLesson | null = null;
        
        for (const section of sectionsData) {
          const sectionLessons = await CourseService.getSectionLessons(section.id);
          lessonsMap[section.id] = sectionLessons;
          
          // Buscar lección anterior y siguiente
          for (const lesson of sectionLessons) {
            // Obtener progreso de cada lección
            const lessonUserProgress = await CourseService.getLessonProgress(user.id, lesson.id);
            if (lessonUserProgress) {
              progressMap[lesson.id] = lessonUserProgress;
            }
            
            if (lesson.id === lessonId) {
              foundCurrent = true;
              if (prevLesson) {
                setPrevLessonId(prevLesson.id);
              }
            } else if (foundCurrent && !nextLesson) {
              nextLesson = lesson;
              setNextLessonId(lesson.id);
              break;
            } else if (!foundCurrent) {
              prevLesson = lesson;
            }
          }
          
          if (nextLesson) break; // Si ya encontramos la siguiente lección, salimos del bucle
        }
        
        setSectionLessons(lessonsMap);
        setLessonProgress(progressMap);
        
        // Actualizar el progreso del curso con esta lección como última vista
        await CourseService.updateCourseProgress(user.id, courseId, lessonId);
        
      } catch (error) {
        console.error("Error cargando la lección:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la lección",
          variant: "destructive",
        });
        navigate(`/tutorials/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, lessonId, user, navigate, toast]);
  
  // Marcar lección como completada
  const handleCompleteLesson = async () => {
    if (!user || !courseId || !lessonId) return;
    
    try {
      await CourseService.markLessonCompleted(user.id, lessonId);
      setIsCompleted(true);
      
      // Actualizar el estado de progreso para esta lección
      setLessonProgress(prev => ({
        ...prev,
        [lessonId]: {
          id: '', // ID temporal
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        }
      }));
      
      toast({
        title: "Lección completada",
        description: "¡Felicidades por tu progreso!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error marcando lección como completada:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el progreso",
        variant: "destructive",
      });
    }
  };
  
  if (!user) {
    navigate('/auth');
    return null;
  }
  
  return (
    <div className="h-screen bg-cybersec-black flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <div className="hidden md:block w-64 h-full border-r border-cybersec-gray overflow-y-auto">
          <CourseSidebar
            sections={sections}
            lessons={sectionLessons}
            courseId={courseId || ''}
            currentLessonId={lessonId}
            lessonProgress={lessonProgress}
          />
        </div>
        
        <div className="flex-1 h-full overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              <div className="h-8 bg-cybersec-darkgray rounded animate-pulse"></div>
              <div className="h-64 bg-cybersec-darkgray rounded animate-pulse"></div>
            </div>
          ) : lesson ? (
            <LessonContent
              lesson={lesson}
              nextLessonId={nextLessonId}
              prevLessonId={prevLessonId}
              courseId={courseId || ''}
              isCompleted={isCompleted}
              onComplete={handleCompleteLesson}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No se pudo cargar la lección</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
