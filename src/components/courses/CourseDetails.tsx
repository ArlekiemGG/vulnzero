
import React from 'react';
import { Clock, Award, User, Calendar, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Course, CourseProgress } from '@/services/CourseService';
import { Progress } from '@/components/ui/progress';

interface CourseDetailsProps {
  course: Course;
  lessonCount: number;
  userProgress?: CourseProgress | null;
  onStartCourse: () => void;
  onResumeCourse: () => void;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({
  course,
  lessonCount,
  userProgress,
  onStartCourse,
  onResumeCourse
}) => {
  // Formatear la fecha de creación
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  // Color según nivel
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'principiante':
        return 'bg-green-950 text-green-500 border-green-500';
      case 'intermedio':
        return 'bg-yellow-950 text-yellow-500 border-yellow-500';
      case 'avanzado':
        return 'bg-red-950 text-red-500 border-red-500';
      default:
        return 'bg-gray-950 text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="bg-cybersec-darkgray border border-cybersec-gray rounded-lg overflow-hidden">
      <div className="h-48 md:h-64 bg-gradient-to-r from-cybersec-black to-cybersec-darkgray relative">
        {course.image_url && (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cybersec-black to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl md:text-3xl font-bold text-cybersec-neongreen mb-2">{course.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getLevelColor(course.level)}>
              {course.level}
            </Badge>
            <Badge variant="outline" className="border-cybersec-electricblue text-cybersec-electricblue">
              {course.category}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        {userProgress && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Tu progreso</span>
              <span className="text-cybersec-neongreen">{userProgress.progress_percentage}%</span>
            </div>
            <Progress value={userProgress.progress_percentage} className="h-2" />
            
            <div className="mt-4">
              {userProgress.progress_percentage === 0 ? (
                <Button 
                  onClick={onStartCourse} 
                  className="w-full bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/90"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Comenzar curso
                </Button>
              ) : userProgress.progress_percentage === 100 ? (
                <Button 
                  onClick={onResumeCourse} 
                  variant="outline" 
                  className="w-full border-green-500 text-green-500 hover:bg-green-800/20"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Repasar curso
                </Button>
              ) : (
                <Button 
                  onClick={onResumeCourse} 
                  className="w-full bg-cybersec-electricblue text-white hover:bg-cybersec-electricblue/90"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continuar curso
                </Button>
              )}
            </div>
          </div>
        )}
        
        {!userProgress && (
          <div className="mb-6">
            <Button 
              onClick={onStartCourse} 
              className="w-full bg-cybersec-neongreen text-cybersec-black hover:bg-cybersec-neongreen/90"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Comenzar curso
            </Button>
          </div>
        )}
        
        <h2 className="text-lg font-semibold text-cybersec-electricblue mb-2">Descripción</h2>
        <p className="text-gray-300 mb-6">{course.description}</p>
        
        <h2 className="text-lg font-semibold text-cybersec-electricblue mb-2">Información del curso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            <User className="h-5 w-5 text-cybersec-yellow" />
            <span>Instructor: </span>
            <span className="text-white">{course.instructor}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="h-5 w-5 text-cybersec-yellow" />
            <span>Duración: </span>
            <span className="text-white">{formatDuration(course.duration_minutes)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <BookOpen className="h-5 w-5 text-cybersec-yellow" />
            <span>Lecciones: </span>
            <span className="text-white">{lessonCount}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="h-5 w-5 text-cybersec-yellow" />
            <span>Publicado: </span>
            <span className="text-white">{formatDate(course.created_at)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Award className="h-5 w-5 text-cybersec-yellow" />
            <span>Nivel: </span>
            <span className="text-white">{course.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
