
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from './services/CourseService';
import { CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

interface CourseCardProps {
  course: Course;
  progress?: number;
  isCompleted?: boolean;
  isLoading?: boolean;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'principiante':
    case 'básico':
      return 'bg-emerald-500 hover:bg-emerald-600';
    case 'intermedio':
      return 'bg-amber-500 hover:bg-amber-600';
    case 'avanzado':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-blue-500 hover:bg-blue-600';
  }
};

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  progress = 0, 
  isCompleted = false,
  isLoading = false 
}) => {
  const [imgError, setImgError] = useState<boolean>(false);

  return (
    <Link 
      to={`/courses/${course.id}`} 
      className="block transition-all duration-300 hover:no-underline"
      state={{ fromCourses: true, courseId: course.id }}
    >
      <Card className="h-full overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-[1.02] bg-cybersec-darkgray border border-gray-700">
        <div className="relative">
          <AspectRatio ratio={16/9}>
            {imgError ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                <div className="text-center p-4">
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm">{course.category}</p>
                </div>
              </div>
            ) : (
              <img 
                src={course.image_url || '/placeholder.svg'} 
                alt={course.title} 
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
          </AspectRatio>
        </div>
        
        <CardHeader className="pb-2 relative">
          <div className="flex justify-between items-start">
            <Badge className={`${getLevelColor(course.level)} text-white px-2 py-1`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
            <Badge variant="outline" className="bg-gray-800/80 text-gray-200">{course.category}</Badge>
          </div>
          <CardTitle className="mt-2 text-white">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-gray-300">{course.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{Math.floor(course.duration_minutes / 60)} horas {course.duration_minutes % 60} min</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="mr-1 h-4 w-4" />
              <span>Por {course.instructor}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2">
          {isLoading ? (
            <div className="w-full">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : isCompleted ? (
            <div className="w-full flex items-center text-emerald-400">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              <span className="font-medium">Curso completado</span>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex justify-between text-sm mb-1 text-gray-300">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CourseCard;
