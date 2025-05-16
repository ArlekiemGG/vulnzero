
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProgressService } from './services/ProgressService';

// Componentes refactorizados
import LessonHeader from './components/LessonHeader';
import LessonContent from './components/LessonContent';
import LessonSidebar from './components/LessonSidebar';
import LessonNavigation from './components/LessonNavigation';
import LessonCompletionButton from './components/LessonCompletionButton';
import LessonDetailSkeleton from './components/LessonDetailSkeleton';

// Hooks
import { useLessonData } from './hooks/useLessonData';

const LessonDetail = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { markLessonAsCompleted } = useProgressService();
  
  // Usar el hook personalizado para cargar los datos de la lección
  const {
    lesson,
    isLoading,
    completed,
    setCompleted,
    nextLesson,
    prevLesson,
    fadeIn
  } = useLessonData(courseId, lessonId, user?.id);

  const handleMarkAsCompleted = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para guardar tu progreso",
        variant: "destructive",
      });
      return;
    }
    
    const success = await markLessonAsCompleted(lessonId!);
    if (success) {
      setCompleted(true);
      
      // Si hay una siguiente lección, preguntar si quiere continuar
      if (nextLesson) {
        setTimeout(() => {
          toast({
            title: "¡Lección completada!",
            description: "¿Quieres continuar con la siguiente lección?",
            action: (
              <button 
                onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)}
                className="bg-primary text-white px-3 py-1 rounded-md text-xs"
              >
                Continuar
              </button>
            )
          });
        }, 500);
      } else {
        toast({
          title: "¡Felicidades!",
          description: "Has completado todas las lecciones de este curso",
        });
      }
    }
  };

  const navigateToLesson = (id: string) => {
    navigate(`/courses/${courseId}/lessons/${id}`);
  };

  // Estado de carga
  if (isLoading) {
    return <LessonDetailSkeleton />;
  }

  // Error al cargar la lección
  if (!lesson) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Lección no encontrada</h2>
          <p className="mt-2 text-gray-500">La lección que buscas no existe o ha sido eliminada</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Volver al curso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container px-4 py-8 mx-auto transition-opacity duration-500 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Contenido principal */}
        <div className="w-full md:w-3/4">
          <LessonHeader courseId={courseId!} />
          <LessonContent lesson={lesson} />
          
          <div className="flex justify-end mb-6">
            <LessonCompletionButton 
              isCompleted={completed} 
              onComplete={handleMarkAsCompleted} 
            />
          </div>
          
          <LessonNavigation 
            courseId={courseId!} 
            prevLesson={prevLesson} 
            nextLesson={nextLesson} 
          />
        </div>
        
        {/* Panel lateral */}
        <div className="w-full md:w-1/4">
          <LessonSidebar 
            currentLesson={lesson}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            onNavigate={navigateToLesson}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
