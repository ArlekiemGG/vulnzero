
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseSections from './CourseSections';
import { SectionWithLessons } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface CourseContentProps {
  sections: SectionWithLessons[];
  courseId: string;
  courseDescription: string;
  completedLessons: Record<string, boolean>;
}

const CourseContent = ({ sections, courseId, courseDescription, completedLessons }: CourseContentProps) => {
  return (
    <Tabs defaultValue="contenido">
      <TabsList className="mb-4">
        <TabsTrigger value="contenido">Contenido</TabsTrigger>
        <TabsTrigger value="descripcion">Descripción</TabsTrigger>
      </TabsList>
      
      <TabsContent value="contenido" className="space-y-4">
        <h2 className="text-2xl font-bold">Contenido del curso</h2>
        <CourseSections 
          sections={sections} 
          courseId={courseId} 
          completedLessons={completedLessons} 
        />
      </TabsContent>
      
      <TabsContent value="descripcion">
        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold mb-4">Descripción</h2>
          <MarkdownRenderer content={courseDescription} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CourseContent;
