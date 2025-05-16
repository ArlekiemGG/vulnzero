
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CourseDetailComponent from '@/components/courses/CourseDetail';
import { Skeleton } from '@/components/ui/skeleton';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set page title
    document.title = "Detalle del curso - VulnZero";
    
    // Simulate minimal loading time to prevent flickering
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-40 w-full mb-8" />
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return <CourseDetailComponent />;
};

export default CourseDetail;
