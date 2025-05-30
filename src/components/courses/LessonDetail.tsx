
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProgressService } from './services/ProgressService';
import { useUser } from '@/contexts/UserContext';

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
  const { courseId, moduleId, lessonId } = useParams<{ courseId: string; moduleId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshUserStats } = useUser(); // Añadimos acceso a refreshUserStats
  const { markLessonAsCompleted } = useProgressService();
  
  console.log(`LessonDetail rendered with params: courseId=${courseId}, moduleId=${moduleId}, lessonId=${lessonId}`);
  
  // Usar el hook personalizado para cargar los datos de la lección
  const {
    lesson,
    isLoading,
    completed,
    setCompleted,
    nextLesson,
    prevLesson,
    fadeIn,
    refreshProgress // Usamos esta función para actualizar el progreso local
  } = useLessonData(courseId, moduleId, lessonId, user?.id);

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
      console.log("LessonDetail: Lección marcada como completada exitosamente");
      setCompleted(true);
      
      // Actualizamos el progreso global del usuario
      await refreshUserStats();
      console.log("LessonDetail: Estadísticas de usuario actualizadas");
      
      // También actualizamos el progreso local del curso
      await refreshProgress();
      console.log("LessonDetail: Progreso local actualizado");
      
      // Si hay una siguiente lección, preguntar si quiere continuar
      if (nextLesson) {
        setTimeout(() => {
          toast({
            title: "¡Lección completada!",
            description: "¿Quieres continuar con la siguiente lección?",
            action: (
              <button 
                onClick={() => navigate(`/courses/${courseId}/learn/${nextLesson.moduleId}/${nextLesson.id}`)}
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
    } else {
      console.error("LessonDetail: Error al marcar la lección como completada");
      toast({
        title: "Error",
        description: "No se pudo marcar la lección como completada",
        variant: "destructive",
      });
    }
  };

  const navigateToLesson = (id: string, targetModuleId: string) => {
    console.log(`Navigating from lesson to: /courses/${courseId}/learn/${targetModuleId || moduleId}/${id}`);
    navigate(`/courses/${courseId}/learn/${targetModuleId || moduleId}/${id}`);
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
            moduleId={moduleId!}
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
