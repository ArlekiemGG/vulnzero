
import { Helmet } from 'react-helmet';
import LessonDetailComponent from '@/components/courses/LessonDetail';

const LessonDetail = () => {
  return (
    <>
      <Helmet>
        <title>Lección - VulnZero</title>
      </Helmet>
      <LessonDetailComponent />
    </>
  );
};

export default LessonDetail;
