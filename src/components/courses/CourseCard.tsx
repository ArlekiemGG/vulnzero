
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from './services/CourseService';
import { CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CourseCardProps {
  course: Course;
  progress?: number;
  isCompleted?: boolean;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'principiante':
      return 'bg-emerald-500 hover:bg-emerald-600';
    case 'intermedio':
      return 'bg-amber-500 hover:bg-amber-600';
    case 'avanzado':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-blue-500 hover:bg-blue-600';
  }
};

const CourseCard: React.FC<CourseCardProps> = ({ course, progress = 0, isCompleted = false }) => {
  return (
    <Link 
      to={`/courses/${course.id}`} 
      className="block transition-opacity"
      state={{ fromCourses: true }}
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        <div className="h-40 bg-gray-200 overflow-hidden">
          <img 
            src={course.image_url} 
            alt={course.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className={`${getLevelColor(course.level)} text-white px-2 py-1`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>
          <CardTitle className="mt-2">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
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
          {isCompleted ? (
            <div className="w-full flex items-center text-emerald-600">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              <span className="font-medium">Curso completado</span>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex justify-between text-sm mb-1">
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
