
import LessonDetailComponent from '@/components/courses/LessonDetail';
import { useEffect } from 'react';

const LessonDetail = () => {
  useEffect(() => {
    document.title = "Lección - VulnZero";
  }, []);

  return <LessonDetailComponent />;
};

export default LessonDetail;
