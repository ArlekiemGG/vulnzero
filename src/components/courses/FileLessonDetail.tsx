
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { findCourseById, findModuleById, findLessonById } from '@/data/courses';
import { useUserCourseProgress } from '@/hooks/use-course-progress';
import LessonQuiz from './components/LessonQuiz';
import EnhancedContentRenderer from './components/EnhancedContentRenderer';
import ErrorBoundary from '@/components/ErrorBoundary';
import './components/lesson-content.css';

interface FileLessonDetailProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

const FileLessonDetail = ({ courseId, moduleId, lessonId }: FileLessonDetailProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadAttempts, setLoadAttempts] = useState<number>(0);
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  const [quizVisible, setQuizVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    completedLessons, 
    completedQuizzes, 
    markLessonAsCompleted, 
    saveQuizResult
  } = useUserCourseProgress(courseId, user?.id);

  // Get course and lesson metadata
  const course = findCourseById(courseId);
  const currentModule = course ? findModuleById(courseId, moduleId) : null;
  const lesson = currentModule ? findLessonById(courseId, moduleId, lessonId) : null;
  
  // Set up navigation to previous/next lessons
  const [prevLesson, setPrevLesson] = useState<{moduleId: string; lessonId: string; title: string} | null>(null);
  const [nextLesson, setNextLesson] = useState<{moduleId: string; lessonId: string; title: string} | null>(null);

  // Determine if the lesson is completed
  const lessonKey = `${courseId}:${moduleId}:${lessonId}`;
  const isCompleted = completedLessons ? !!completedLessons[lessonKey] : false;
  const quizCompleted = completedQuizzes ? !!completedQuizzes[lessonKey] : false;

  // Handle synchronizing course content
  const handleSyncContent = () => {
    setLoadAttempts(prev => prev + 1);
    setIsLoading(true);
    setError(null);
    toast({
      title: "Sincronizando contenido",
      description: "Intentando cargar el contenido de la lección de nuevo..."
    });
  };

  useEffect(() => {
    const setup = async () => {
      if (!course || !currentModule || !lesson) {
        setError("No se encontró la lección solicitada");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Log the path we're attempting to fetch
        const contentPath = `/courses/${courseId}/${moduleId}/${lessonId}.html`;
        console.log(`Intentando cargar el contenido de la lección desde: ${contentPath}`);
        
        // Fetch lesson content from HTML file
        const response = await fetch(contentPath);
        
        if (!response.ok) {
          console.error(`Error cargando el contenido de la lección: ${response.status} ${response.statusText}`);
          
          // More descriptive error message based on status code
          if (response.status === 404) {
            throw new Error(`No se encontró el archivo de contenido en la ruta: ${contentPath}`);
          } else {
            throw new Error(`Error al cargar el contenido (${response.status}): ${response.statusText}`);
          }
        }
        
        const html = await response.text();
        if (!html || html.trim() === '') {
          throw new Error("El archivo de contenido está vacío");
        }
        
        setContent(html);
        
        // Set up navigation between lessons
        setupNavigation();
        setFadeIn(true);
      } catch (error) {
        console.error('Error cargando el contenido de la lección:', error);
        setError(error instanceof Error ? error.message : "No se pudo cargar el contenido de la lección. Verifica que el archivo exista.");
      } finally {
        setIsLoading(false);
      }
    };

    setup();
  }, [courseId, moduleId, lessonId, navigate, course, currentModule, lesson, loadAttempts]);

  const setupNavigation = () => {
    if (!course || !currentModule) return;

    // Find current lesson index
    const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
    const lessonIndex = currentModule.lessons.findIndex(l => l.id === lessonId);

    // Previous lesson
    if (lessonIndex > 0) {
      // Previous lesson in same module
      const prevLessonData = currentModule.lessons[lessonIndex - 1];
      setPrevLesson({
        moduleId,
        lessonId: prevLessonData.id,
        title: prevLessonData.title
      });
    } else if (moduleIndex > 0) {
      // Last lesson from previous module
      const prevModule = course.modules[moduleIndex - 1];
      const prevLessonData = prevModule.lessons[prevModule.lessons.length - 1];
      setPrevLesson({
        moduleId: prevModule.id,
        lessonId: prevLessonData.id,
        title: prevLessonData.title
      });
    } else {
      setPrevLesson(null);
    }

    // Next lesson
    if (lessonIndex < currentModule.lessons.length - 1) {
      // Next lesson in same module
      const nextLessonData = currentModule.lessons[lessonIndex + 1];
      setNextLesson({
        moduleId,
        lessonId: nextLessonData.id,
        title: nextLessonData.title
      });
    } else if (moduleIndex < course.modules.length - 1) {
      // First lesson from next module
      const nextModule = course.modules[moduleIndex + 1];
      const nextLessonData = nextModule.lessons[0];
      setNextLesson({
        moduleId: nextModule.id,
        lessonId: nextLessonData.id,
        title: nextLessonData.title
      });
    } else {
      setNextLesson(null);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para guardar tu progreso",
        variant: "destructive",
      });
      return;
    }
    
    const success = await markLessonAsCompleted(moduleId, lessonId);
    if (success) {
      toast({
        title: "¡Lección completada!",
        description: "Tu progreso ha sido guardado",
      });
      
      // Show quiz if it has one and hasn't been completed yet
      if (lesson?.has_quiz && !quizCompleted) {
        setQuizVisible(true);
      } else if (nextLesson) {
        // Suggest continuing to next lesson
        toast({
          title: "¿Continuar?",
          description: "¿Quieres avanzar a la siguiente lección?",
          action: (
            <Button onClick={() => navigateToLesson(nextLesson.moduleId, nextLesson.lessonId)}>
              Continuar
            </Button>
          )
        });
      }
    }
  };

  const handleQuizComplete = async (score: number, answers: Record<string, number>) => {
    if (!user) return;
    
    await saveQuizResult(moduleId, lessonId, score, answers);
    
    toast({
      title: "Quiz completado",
      description: `Has obtenido ${score}% de respuestas correctas`,
    });
    
    // Suggest continuing to next lesson if available
    if (nextLesson) {
      setTimeout(() => {
        toast({
          title: "¿Continuar?",
          description: "¿Quieres avanzar a la siguiente lección?",
          action: (
            <Button onClick={() => navigateToLesson(nextLesson.moduleId, nextLesson.lessonId)}>
              Continuar
            </Button>
          )
        });
      }, 1500);
    }
  };

  const navigateToLesson = (moduleId: string, lessonId: string) => {
    navigate(`/courses/${courseId}/${moduleId}/${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <div className="space-y-4 mb-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="w-full md:w-1/4">
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson || !course || !currentModule) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center">
          <Alert variant="destructive" className="mb-6 max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "La lección que buscas no existe o ha sido eliminada"}
            </AlertDescription>
          </Alert>
          <div className="space-y-2 mt-4">
            <p className="text-gray-400">Verifica la ruta:</p>
            <code className="px-2 py-1 bg-gray-800 rounded text-xs">
              /courses/{courseId}/{moduleId}/{lessonId}.html
            </code>
            <div className="mt-4">
              <Button 
                variant="outline"
                onClick={handleSyncContent} 
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar contenido
              </Button>
              <Button onClick={() => navigate(`/courses/${courseId}`)}>
                Volver al curso
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`container px-4 py-8 mx-auto transition-opacity duration-500 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="w-full md:w-3/4">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/courses/${courseId}`)}
                className="p-0 hover:bg-transparent hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Volver al curso</span>
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                onClick={handleSyncContent}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sincronizar
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
            
            <div className="flex items-center text-sm text-gray-500 mb-8">
              <BookOpen className="mr-1 h-4 w-4" />
              <span>{lesson.duration_minutes} minutos de lectura</span>
            </div>
            
            <div className="mb-8 rounded-lg shadow-lg overflow-hidden">
              <EnhancedContentRenderer content={content} />
            </div>
            
            {quizVisible && lesson.has_quiz && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Quiz - Comprueba tus conocimientos</h3>
                <LessonQuiz 
                  courseId={courseId} 
                  moduleId={moduleId} 
                  lessonId={lessonId} 
                  onComplete={handleQuizComplete}
                  completed={quizCompleted}
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t">
              <div className="mb-4 sm:mb-0">
                {prevLesson && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigateToLesson(prevLesson.moduleId, prevLesson.lessonId)}
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span>Anterior</span>
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {isCompleted ? (
                  <Button variant="outline" className="flex items-center" disabled>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Completada</span>
                  </Button>
                ) : (
                  <Button onClick={handleMarkAsCompleted}>
                    Marcar como completada
                  </Button>
                )}
                
                {nextLesson && (
                  <Button 
                    onClick={() => navigateToLesson(nextLesson.moduleId, nextLesson.lessonId)}
                    className="flex items-center"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <Card className="sticky top-24 bg-gray-800 border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Navegación rápida</h3>
                
                {prevLesson && (
                  <>
                    <div className="mb-3">
                      <div className="text-sm text-gray-400">Anterior</div>
                      <button 
                        onClick={() => navigateToLesson(prevLesson.moduleId, prevLesson.lessonId)}
                        className="text-left font-medium hover:text-blue-400 transition-colors"
                      >
                        {prevLesson.title}
                      </button>
                    </div>
                    <Separator className="my-3 bg-gray-700" />
                  </>
                )}
                
                <div className="mb-3">
                  <div className="text-sm text-gray-400">Actual</div>
                  <div className="font-medium text-blue-400">{lesson.title}</div>
                </div>
                
                {nextLesson && (
                  <>
                    <Separator className="my-3 bg-gray-700" />
                    <div>
                      <div className="text-sm text-gray-400">Siguiente</div>
                      <button 
                        onClick={() => navigateToLesson(nextLesson.moduleId, nextLesson.lessonId)}
                        className="text-left font-medium hover:text-blue-400 transition-colors"
                      >
                        {nextLesson.title}
                      </button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FileLessonDetail;
