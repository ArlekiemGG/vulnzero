import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';
import { findCourseById, findModuleById, findLessonById } from '@/data/courses';
import { toast } from '@/components/ui/use-toast';
import EnhancedContentRenderer from '@/components/courses/components/EnhancedContentRenderer';
import LessonQuiz from '@/components/courses/components/LessonQuiz';
import { useUserCourseProgress } from '@/hooks/use-course-progress';
import { ChevronLeft, ChevronRight, AlertCircle, BookOpen, CheckCircle, Unlock } from 'lucide-react';

// Definimos las props esperadas para LessonQuiz
interface LessonQuizProps {
  quizData: any;
  onComplete: (score: number, answers: Record<string, number>) => Promise<void>;
}

const LessonDetail = () => {
  const { courseId, moduleId, lessonId } = useParams<{ courseId: string, moduleId: string, lessonId: string }>();
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  const navigate = useNavigate();

  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<any>(null);

  const { progress, completedLessons, markLessonAsCompleted, saveQuizResult } = 
    useUserCourseProgress(courseId || '', user?.id);

  useEffect(() => {
    if (courseId && moduleId && lessonId) {
      loadLessonContent();
    }

    // Reset scroll to top
    window.scrollTo(0, 0);
  }, [courseId, moduleId, lessonId]);

  const loadLessonContent = async () => {
    if (!courseId || !moduleId || !lessonId) {
      setError("Parámetros de URL incompletos");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get lesson metadata
      const course = findCourseById(courseId);
      if (!course) {
        setError("Curso no encontrado");
        return;
      }

      const module = findModuleById(courseId, moduleId);
      if (!module) {
        setError("Módulo no encontrado");
        return;
      }

      const lesson = findLessonById(courseId, moduleId, lessonId);
      if (!lesson) {
        setError("Lección no encontrada");
        return;
      }

      setTitle(lesson.title);
      document.title = `${lesson.title} - ${course.title} - VulnZero`;

      // Load HTML content
      console.log(`Intentando cargar el contenido de la lección desde: /courses/${courseId}/${moduleId}/${lessonId}.html`);
      const response = await fetch(`/courses/${courseId}/${moduleId}/${lessonId}.html`);
      
      if (!response.ok) {
        console.error(`Error cargando contenido: ${response.status} ${response.statusText}`);
        setError("No se pudo cargar el contenido de la lección. Verifica que el archivo exista.");
        return;
      }

      const htmlContent = await response.text();
      setContent(htmlContent);

      // Check for quiz
      if (lesson.has_quiz) {
        try {
          const quizResponse = await fetch(`/courses/${courseId}/${moduleId}/${lessonId}-quiz.json`);
          if (quizResponse.ok) {
            const quizJson = await quizResponse.json();
            setQuizData(quizJson);
          } else {
            console.log("Quiz file not found or invalid");
          }
        } catch (quizErr) {
          console.error("Error loading quiz:", quizErr);
        }
      }

    } catch (err) {
      console.error("Error loading lesson content:", err);
      setError("Error al cargar el contenido. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextLesson = async () => {
    if (!courseId || !moduleId || !lessonId) return;
    
    try {
      const course = findCourseById(courseId);
      if (!course) return;
      
      const currentModuleIndex = course.modules.findIndex(m => m.id === moduleId);
      if (currentModuleIndex === -1) return;
      
      const currentModule = course.modules[currentModuleIndex];
      const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === lessonId);
      
      // If not the last lesson in module
      if (currentLessonIndex < currentModule.lessons.length - 1) {
        const nextLesson = currentModule.lessons[currentLessonIndex + 1];
        navigate(`/courses/${courseId}/learn/${moduleId}/${nextLesson.id}`);
      } 
      // If last lesson but not last module
      else if (currentModuleIndex < course.modules.length - 1) {
        const nextModule = course.modules[currentModuleIndex + 1];
        if (nextModule.lessons.length > 0) {
          navigate(`/courses/${courseId}/learn/${nextModule.id}/${nextModule.lessons[0].id}`);
        }
      } 
      // Last lesson of last module
      else {
        // Navigate to course completion or course detail
        toast({
          title: "¡Curso completado!",
          description: "Has finalizado todas las lecciones de este curso",
        });
        navigate(`/courses/${courseId}`);
      }
    } catch (err) {
      console.error("Error navigating to next lesson:", err);
    }
  };

  const handlePreviousLesson = () => {
    if (!courseId || !moduleId || !lessonId) return;
    
    try {
      const course = findCourseById(courseId);
      if (!course) return;
      
      const currentModuleIndex = course.modules.findIndex(m => m.id === moduleId);
      if (currentModuleIndex === -1) return;
      
      const currentModule = course.modules[currentModuleIndex];
      const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === lessonId);
      
      // If not the first lesson in module
      if (currentLessonIndex > 0) {
        const prevLesson = currentModule.lessons[currentLessonIndex - 1];
        navigate(`/courses/${courseId}/learn/${moduleId}/${prevLesson.id}`);
      } 
      // If first lesson but not first module
      else if (currentModuleIndex > 0) {
        const prevModule = course.modules[currentModuleIndex - 1];
        if (prevModule.lessons.length > 0) {
          const lastLesson = prevModule.lessons[prevModule.lessons.length - 1];
          navigate(`/courses/${courseId}/learn/${prevModule.id}/${lastLesson.id}`);
        }
      }
      // First lesson of first module - go to course detail
      else {
        navigate(`/courses/${courseId}`);
      }
    } catch (err) {
      console.error("Error navigating to previous lesson:", err);
    }
  };

  const handleCompleteLesson = async () => {
    if (!courseId || !moduleId || !lessonId || !user) return;
    
    if (quizData && quizData.questions && quizData.questions.length > 0) {
      setShowQuiz(true);
      return;
    }
    
    const success = await markLessonAsCompleted(moduleId, lessonId);
    
    if (success) {
      toast({
        title: "¡Lección completada!",
        description: "Avanzando a la siguiente lección",
      });
      handleNextLesson();
    }
  };

  const handleQuizComplete = async (score: number, answers: Record<string, number>) => {
    if (!courseId || !moduleId || !lessonId || !user) return;
    
    const success = await saveQuizResult(moduleId, lessonId, score, answers);
    
    if (success) {
      setShowQuiz(false);
      
      if (score >= 70) {
        toast({
          title: "¡Quiz completado correctamente!",
          description: `Has obtenido ${score}% de respuestas correctas`,
        });
        handleNextLesson();
      } else {
        toast({
          title: "Debes mejorar tu puntuación",
          description: `Has obtenido ${score}% de respuestas correctas. Necesitas al menos 70% para avanzar.`,
          variant: "destructive"
        });
      }
    }
  };

  const isLessonCompleted = () => {
    if (!courseId || !lessonId) return false;
    return completedLessons[`${courseId}:${lessonId}`] === true;
  };

  const getCourseProgressInfo = () => {
    if (!courseId) return null;
    
    const course = findCourseById(courseId);
    if (!course) return null;
    
    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const completedCount = Object.keys(completedLessons).filter(key => key.startsWith(`${courseId}:`) && completedLessons[key]).length;
    
    return {
      totalLessons,
      completedCount,
      percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
    };
  };

  const progressInfo = getCourseProgressInfo();

  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`pt-16 pb-8 ${user ? 'md:pl-64' : ''}`}>
        <div className="container px-4 mx-auto">
          {/* Course navigation */}
          <div className="mb-6 flex flex-wrap items-center text-sm">
            <Link 
              to={`/courses/${courseId}`} 
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              Curso
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-600" />
            
            {moduleId && (
              <>
                <span className="text-gray-300">
                  {findModuleById(courseId || '', moduleId)?.title || 'Módulo'}
                </span>
                <ChevronRight className="h-4 w-4 mx-1 text-gray-600" />
              </>
            )}
            
            <span className="text-white font-medium">
              {title || 'Lección'}
            </span>
          </div>
          
          {/* Progress status */}
          {user && progressInfo && (
            <div className="mb-6 flex items-center text-sm text-gray-300">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{progressInfo.completedCount} de {progressInfo.totalLessons} lecciones completadas ({progressInfo.percentage}%)</span>
            </div>
          )}

          {/* Lesson content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="bg-cybersec-black border-gray-800">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-cybersec-neongreen mb-4">{title}</h1>
                  
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {showQuiz && quizData ? (
                    <LessonQuiz 
                      quizData={quizData} 
                      onComplete={handleQuizComplete}
                    />
                  ) : (
                    <EnhancedContentRenderer content={content} />
                  )}
                  
                  {/* Navigation and completion controls */}
                  <div className="mt-8 pt-4 border-t border-gray-800">
                    <div className="flex flex-wrap justify-between items-center">
                      <Button 
                        variant="outline" 
                        onClick={handlePreviousLesson} 
                        className="mb-2 sm:mb-0"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" /> Lección anterior
                      </Button>
                      
                      <div className="flex gap-2">
                        {isLessonCompleted() ? (
                          <Button variant="outline" disabled className="bg-green-900/20 border-green-700 text-green-500">
                            <CheckCircle className="mr-2 h-4 w-4" /> Completado
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleCompleteLesson}
                            className="bg-cybersec-neongreen hover:bg-cybersec-neongreen/90 text-black"
                          >
                            {quizData ? (
                              <>Realizar quiz</>
                            ) : (
                              <>Marcar como completado</>
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          onClick={handleNextLesson}
                        >
                          Siguiente lección <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Sidebar content */}
            <div className="lg:col-span-1">
              <Card className="bg-cybersec-black border-gray-800">
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-3">Navegación rápida</h3>
                  
                  <Separator className="mb-3" />
                  
                  {courseId && moduleId && (
                    <div className="space-y-2">
                      {(() => {
                        const course = findCourseById(courseId);
                        const module = course?.modules.find(m => m.id === moduleId);
                        
                        return module?.lessons.map((lesson, index) => {
                          const isActive = lesson.id === lessonId;
                          const isCompleted = completedLessons[`${courseId}:${lesson.id}`] === true;
                          
                          return (
                            <Link 
                              key={lesson.id}
                              to={`/courses/${courseId}/learn/${moduleId}/${lesson.id}`}
                              className={`flex items-center py-2 px-3 text-sm rounded transition-colors ${
                                isActive ? 'bg-cybersec-darkgray' : 'hover:bg-cybersec-darkgray/50'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border border-gray-600 text-xs flex items-center justify-center mr-2">
                                  {index + 1}
                                </div>
                              )}
                              <span className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
                                {lesson.title}
                              </span>
                              {lesson.has_quiz && (
                                <Badge variant="outline" className="ml-2 text-xs">Quiz</Badge>
                              )}
                            </Link>
                          );
                        });
                      })()}
                      
                      <div className="pt-4 border-t border-gray-800 mt-4">
                        <Link 
                          to={`/courses/${courseId}`}
                          className="flex items-center py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" /> 
                          Volver al curso
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Prerequisites and info card */}
              {!user && (
                <Card className="bg-cybersec-black border-gray-800 mt-4 p-4">
                  <div className="flex items-center text-amber-400 mb-2">
                    <Unlock className="h-4 w-4 mr-2" />
                    <h3 className="font-medium">Desbloquea todas las funciones</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Inicia sesión para seguir tu progreso, completar quizzes y obtener certificados.
                  </p>
                  <Button asChild variant="default" className="w-full">
                    <Link to="/auth">Iniciar sesión</Link>
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonDetail;
