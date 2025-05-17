
import { useState, useEffect, useCallback } from 'react';
import { HybridCourseService } from '../services/HybridCourseService';
import { useUserCourseProgress } from '@/hooks/use-course-progress';
import { toast } from '@/components/ui/use-toast';

export function useLessonData(courseId?: string, moduleId?: string, lessonId?: string, userId?: string) {
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prevLesson, setPrevLesson] = useState<any>(null);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [fadeIn, setFadeIn] = useState(false);
  
  // Obtener progreso del curso
  const { 
    completedLessons, 
    refreshProgress 
  } = useUserCourseProgress(courseId, userId);
  
  // Determinar si la lección está completada
  const [completed, setCompleted] = useState(false);
  
  // Cargar datos de la lección
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!courseId || !lessonId) {
        console.error('useLessonData: Missing courseId or lessonId');
        setIsLoading(false);
        return;
      }
      
      try {
        setFadeIn(false);
        setIsLoading(true);
        
        console.log(`useLessonData: Fetching lesson data for courseId=${courseId}, lessonId=${lessonId}`);
        const lessonData = await HybridCourseService.getLessonById(lessonId);
        
        if (lessonData) {
          console.log('useLessonData: Lesson data found:', lessonData);
          setLesson(lessonData);
          
          // Determinar si está completada basado en el estado de progreso
          const isLessonCompleted = completedLessons && 
            (completedLessons[lessonId] || completedLessons[`${courseId}:${lessonId}`]);
          
          console.log(`useLessonData: Lesson completion status: ${isLessonCompleted}`);
          setCompleted(!!isLessonCompleted);
          
          // Cargar lecciones anterior y siguiente
          try {
            const { prevLesson, nextLesson } = await HybridCourseService.getAdjacentLessons(courseId, lessonId);
            
            // Adaptamos los resultados para mantener compatibilidad con la propiedad moduleId
            if (prevLesson) {
              setPrevLesson({
                ...prevLesson,
                moduleId: prevLesson.section_id
              });
            } else {
              setPrevLesson(null);
            }
            
            if (nextLesson) {
              setNextLesson({
                ...nextLesson,
                moduleId: nextLesson.section_id
              });
            } else {
              setNextLesson(null);
            }
            
            console.log('useLessonData: Adjacent lessons loaded:', { 
              prevLesson: prevLesson ? { ...prevLesson, moduleId: prevLesson.section_id } : null, 
              nextLesson: nextLesson ? { ...nextLesson, moduleId: nextLesson.section_id } : null 
            });
          } catch (error) {
            console.error('useLessonData: Error loading adjacent lessons:', error);
            // No fallamos toda la carga si solo fallan las lecciones adyacentes
          }
        } else {
          console.warn(`useLessonData: No lesson found with id ${lessonId} in course ${courseId}`);
        }
      } catch (error) {
        console.error('useLessonData: Error loading lesson data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la lección"
        });
      } finally {
        setIsLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      }
    };
    
    fetchLessonData();
  }, [courseId, lessonId, completedLessons]);
  
  return {
    lesson,
    isLoading,
    completed,
    setCompleted,
    prevLesson,
    nextLesson,
    fadeIn,
    refreshProgress
  };
}
