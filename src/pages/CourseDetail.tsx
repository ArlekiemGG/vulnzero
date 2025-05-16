
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseDetailComponent from '@/components/courses/CourseDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { CourseService } from '@/components/courses/services/CourseService';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [courseExists, setCourseExists] = useState(false);

  useEffect(() => {
    // Set page title
    document.title = "Detalle del curso - VulnZero";
    
    // Check if the course exists
    const verifyCourseExists = async () => {
      if (!courseId) {
        navigate('/courses');
        return;
      }

      try {
        console.log(`Verifying course exists: ${courseId}`);
        const course = await CourseService.getCourseById(courseId);
        
        if (course) {
          console.log(`Course found:`, course);
          setCourseExists(true);
        } else {
          console.log(`Course not found: ${courseId}`);
          toast({
            title: "Curso no encontrado",
            description: "El curso que intentas ver no existe",
            variant: "destructive",
          });
          navigate('/courses');
        }
      } catch (error) {
        console.error("Error verifying course:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el curso",
          variant: "destructive",
        });
        navigate('/courses');
      } finally {
        // Simulate minimal loading time to prevent flickering
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    };
    
    verifyCourseExists();
  }, [courseId, navigate]);

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

  // Only render the CourseDetailComponent if the course exists
  return courseExists ? <CourseDetailComponent /> : null;
};

export default CourseDetail;
