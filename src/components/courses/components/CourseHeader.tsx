
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Award } from 'lucide-react';
import { Course } from '../services/CourseService';

interface CourseHeaderProps {
  course: Course;
  totalLessons: number;
}

const CourseHeader = ({ course, totalLessons }: CourseHeaderProps) => {
  const levelColor = course.level === 'principiante' 
    ? 'bg-emerald-500' 
    : course.level === 'intermedio' 
      ? 'bg-amber-500' 
      : 'bg-red-500';

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={`${levelColor} text-white px-2 py-1`}>
          {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
        </Badge>
        <Badge variant="outline">{course.category}</Badge>
      </div>
      
      <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
      
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8">
        <div className="flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          <span>{Math.floor(course.duration_minutes / 60)} horas {course.duration_minutes % 60} min</span>
        </div>
        <div className="flex items-center">
          <BookOpen className="mr-1 h-4 w-4" />
          <span>Por {course.instructor}</span>
        </div>
        <div className="flex items-center">
          <Award className="mr-1 h-4 w-4" />
          <span>{totalLessons} lecciones</span>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
