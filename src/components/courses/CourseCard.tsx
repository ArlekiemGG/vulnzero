
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, Clock, User, ArrowRight } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Progress } from '@/components/ui/progress';
import { Course } from '@/services/CourseService';

interface CourseCardProps {
  course: Course;
  progress?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, progress }) => {
  // Determinar el color de nivel
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

  // Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="bg-cybersec-darkgray border-cybersec-darkgray hover:border-cybersec-neongreen transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-cybersec-neongreen">
            {course.title}
          </CardTitle>
          <Badge variant="outline" className={getLevelColor(course.level)}>
            {course.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="mb-4">
          <AspectRatio ratio={16 / 9} className="rounded-md overflow-hidden bg-cybersec-black">
            <img 
              src={course.image_url || "/placeholder.svg"} 
              alt={course.title} 
              className="object-cover h-full w-full opacity-70 hover:opacity-100 transition-opacity"
            />
            <Badge 
              variant="outline" 
              className="absolute top-2 right-2 border-cybersec-electricblue text-cybersec-electricblue"
            >
              {course.category}
            </Badge>
          </AspectRatio>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-300 line-clamp-2">{course.description}</p>
          
          <div className="flex justify-between items-center text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-cybersec-yellow" />
              <span>{course.instructor}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-cybersec-yellow" />
              <span>{formatDuration(course.duration_minutes)}</span>
            </div>
          </div>
          
          {typeof progress === 'number' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-cybersec-darkgray border border-cybersec-neongreen text-cybersec-neongreen hover:bg-cybersec-neongreen hover:text-cybersec-black" 
          asChild
        >
          <Link to={`/tutorials/${course.id}`} className="flex items-center justify-center gap-2">
            {typeof progress === 'number' && progress > 0 ? 'Continuar curso' : 'Ver curso'} 
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
