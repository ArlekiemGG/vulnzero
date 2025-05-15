
import CourseDetailComponent from '@/components/courses/CourseDetail';
import { useEffect } from 'react';

const CourseDetail = () => {
  useEffect(() => {
    document.title = "Detalle del curso - VulnZero";
  }, []);

  return <CourseDetailComponent />;
};

export default CourseDetail;
