
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Circle, CheckCircle, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionWithLessons } from '../types';

interface CourseSectionsProps {
  sections: SectionWithLessons[];
  courseId: string;
  completedLessons: Record<string, boolean>;
}

const CourseSections = ({ sections, courseId, completedLessons }: CourseSectionsProps) => {
  const navigate = useNavigate();

  return (
    <>
      {sections.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id} className="border rounded-lg mb-4 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center">
                    <span className="font-semibold">{section.title}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{section.lessons.length} lecciones</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="divide-y">
                  {section.lessons.map((lesson) => (
                    <div 
                      key={lesson.id} 
                      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                    >
                      <div className="mr-3">
                        {completedLessons[lesson.id] ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{lesson.title}</div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{lesson.duration_minutes} min</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-gray-500">No hay secciones disponibles para este curso</p>
      )}
    </>
  );
};

export default CourseSections;
