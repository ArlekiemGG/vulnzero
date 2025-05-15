
import { Helmet } from 'react-helmet';
import CourseTabs from '@/components/courses/CourseTabs';
import { SearchIcon } from 'lucide-react';

const Courses: React.FC = () => {
  return (
    <div className="container px-4 py-8 mx-auto">
      <Helmet>
        <title>Cursos - VulnZero</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cursos de Ciberseguridad</h1>
          <p className="text-gray-500 mt-2">
            Aprende a tu ritmo con nuestros cursos estructurados
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-500" />
          </div>
          <input 
            type="text"
            placeholder="Buscar cursos..."
            className="w-full py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <CourseTabs />
    </div>
  );
};

export default Courses;
