
import { Helmet } from 'react-helmet';
import CourseDetailComponent from '@/components/courses/CourseDetail';

const CourseDetail = () => {
  return (
    <>
      <Helmet>
        <title>Detalle del curso - VulnZero</title>
      </Helmet>
      <CourseDetailComponent />
    </>
  );
};

export default CourseDetail;
