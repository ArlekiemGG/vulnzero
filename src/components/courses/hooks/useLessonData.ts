
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { HybridCourseService } from '../services/HybridCourseService';
import { useProgressService } from '../services/ProgressService';
import { useNavigate } from 'react-router-dom';

export const useLessonData = (courseId: string | undefined, lessonId: string | undefined, userId?: string) => {
  const navigate = useNavigate();
  const { getLessonProgress } = useProgressService();
  
  const [lesson, setLesson] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(false);
  const [nextLesson, setNextLesson] = useState<{id: string; title: string} | null>(null);
  const [prevLesson, setPrevLesson] = useState<{id: string; title: string} | null>(null);
  const [fadeIn, setFadeIn] = useState<boolean>(false);

  useEffect(() => {
    // Agregamos un efecto de fade-in cuando se cargan los datos
    if (!isLoading && lesson) {
      const timer = setTimeout(() => setFadeIn(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, lesson]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setFadeIn(false);
  }, [lessonId]);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId || !courseId) return;
      setIsLoading(true);
      
      try {
        // Obtener datos de la lección usando el servicio híbrido
        const lessonData = await HybridCourseService.getLessonById(lessonId);
        if (!lessonData) {
          toast({
            title: "Lección no encontrada",
            description: "La lección que buscas no existe",
            variant: "destructive",
          });
          navigate(`/courses/${courseId}`);
          return;
        }
        setLesson(lessonData);
        
        // Obtener sección a la que pertenece la lección
        const sectionsData = await HybridCourseService.getCourseSections(courseId);
        const currentSectionId = lessonData.section_id;
        const currentSection = sectionsData.find(s => s.id === currentSectionId);
        
        if (!currentSection) {
          toast({
            title: "Error",
            description: "No se pudo encontrar la sección de esta lección",
            variant: "destructive",
          });
          navigate(`/courses/${courseId}`);
          return;
        }
        
        // Obtener todas las lecciones de la sección para navegación
        const sectionLessons = await HybridCourseService.getSectionLessons(currentSectionId);
        const currentIndex = sectionLessons.findIndex(l => l.id === lessonId);
        
        // Configurar navegación entre lecciones
        await setupNavigation(sectionsData, currentSection, sectionLessons, currentIndex, currentSectionId);
        
        // Verificar si la lección está completada
        if (userId) {
          const progress = await getLessonProgress(lessonId);
          setCompleted(progress?.completed || false);
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la lección",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLessonData();
  }, [courseId, lessonId, userId, navigate, getLessonProgress]);

  const setupNavigation = async (
    sectionsData: any[], 
    currentSection: any, 
    sectionLessons: any[], 
    currentIndex: number,
    currentSectionId: string
  ) => {
    // Configurar navegación a lección anterior
    if (currentIndex > 0) {
      setPrevLesson({
        id: sectionLessons[currentIndex - 1].id,
        title: sectionLessons[currentIndex - 1].title
      });
    } else {
      // Buscar la última lección de la sección anterior
      const currentSectionIndex = sectionsData.findIndex(s => s.id === currentSectionId);
      if (currentSectionIndex > 0) {
        const prevSectionId = sectionsData[currentSectionIndex - 1].id;
        const prevSectionLessons = await HybridCourseService.getSectionLessons(prevSectionId);
        if (prevSectionLessons.length > 0) {
          const lastLesson = prevSectionLessons[prevSectionLessons.length - 1];
          setPrevLesson({
            id: lastLesson.id,
            title: lastLesson.title
          });
        } else {
          setPrevLesson(null);
        }
      } else {
        setPrevLesson(null);
      }
    }
    
    // Configurar navegación a siguiente lección
    if (currentIndex < sectionLessons.length - 1) {
      setNextLesson({
        id: sectionLessons[currentIndex + 1].id,
        title: sectionLessons[currentIndex + 1].title
      });
    } else {
      // Buscar la primera lección de la siguiente sección
      const currentSectionIndex = sectionsData.findIndex(s => s.id === currentSectionId);
      if (currentSectionIndex < sectionsData.length - 1) {
        const nextSectionId = sectionsData[currentSectionIndex + 1].id;
        const nextSectionLessons = await HybridCourseService.getSectionLessons(nextSectionId);
        if (nextSectionLessons.length > 0) {
          setNextLesson({
            id: nextSectionLessons[0].id,
            title: nextSectionLessons[0].title
          });
        } else {
          setNextLesson(null);
        }
      } else {
        setNextLesson(null);
      }
    }
  };

  return {
    lesson,
    isLoading,
    completed,
    setCompleted,
    nextLesson,
    prevLesson,
    fadeIn
  };
};
