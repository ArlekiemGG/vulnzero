
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Award, BookOpen, Clock, Play, CircleDot, BarChart } from 'lucide-react';

interface CourseProgressPanelProps {
  progress: number;
  completedLessonsCount: number;
  totalLessons: number;
  durationHours: number;
  durationMinutes: number;
  onContinue: () => void;
  onStart: () => void;
}

const CourseProgressPanel = ({ 
  progress, 
  completedLessonsCount, 
  totalLessons,
  durationHours,
  durationMinutes,
  onContinue, 
  onStart 
}: CourseProgressPanelProps) => {
  const { user } = useAuth();

  return (
    <Card className="sticky top-24">
      <CardContent className="p-0">
        <div className="p-6">
          {progress > 0 ? (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Tu progreso</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 mb-1" />
              <p className="text-sm text-gray-500">
                {completedLessonsCount} de {totalLessons} lecciones completadas
              </p>
            </div>
          ) : user ? (
            <div className="text-center mb-6">
              <CircleDot className="h-12 w-12 mx-auto text-primary mb-2" />
              <p className="font-medium">Aún no has comenzado este curso</p>
              <p className="text-sm text-gray-500 mb-4">¡Empieza ahora para registrar tu progreso!</p>
            </div>
          ) : (
            <div className="text-center mb-6">
              <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="font-medium">Inicia sesión para registrar tu progreso</p>
            </div>
          )}
          
          <Button 
            className="w-full flex items-center justify-center mb-4" 
            onClick={progress > 0 ? onContinue : onStart}
          >
            <Play className="mr-2 h-4 w-4" />
            {progress > 0 ? 'Continuar aprendizaje' : 'Comenzar curso'}
          </Button>
          
          {!user && (
            <p className="text-sm text-center text-gray-500">
              Inicia sesión para guardar tu progreso
            </p>
          )}
        </div>
        
        <Separator />
        
        <div className="p-6">
          <h3 className="font-semibold mb-4">Este curso incluye:</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <BookOpen className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <span>{totalLessons} lecciones</span>
            </li>
            <li className="flex items-start">
              <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <span>{durationHours} horas {durationMinutes} minutos de contenido</span>
            </li>
            <li className="flex items-start">
              <Award className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <span>Certificado de finalización</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseProgressPanel;
