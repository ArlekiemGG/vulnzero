
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LessonSidebarProps {
  currentLesson: {
    id: string;
    title: string;
    content?: string;
    duration_minutes?: number;
  };
  prevLesson: {id: string; title: string; moduleId?: string} | null;
  nextLesson: {id: string; title: string; moduleId?: string} | null;
  onNavigate: (id: string, moduleId: string) => void;
}

const LessonSidebar = ({
  currentLesson,
  prevLesson,
  nextLesson,
  onNavigate,
}: LessonSidebarProps) => {
  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Navegación de lecciones</h3>

        {prevLesson ? (
          <>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Lección anterior</div>
              <button
                onClick={() => onNavigate(prevLesson.id, prevLesson.moduleId || '')}
                className="flex items-center text-left hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="text-sm font-medium">{prevLesson.title}</span>
              </button>
            </div>
            <Separator className="my-4" />
          </>
        ) : null}

        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Lección actual</div>
          <div className="text-sm font-medium text-primary">
            {currentLesson.title}
          </div>
        </div>

        {nextLesson ? (
          <>
            <Separator className="my-4" />
            <div>
              <div className="text-sm text-gray-500 mb-1">Siguiente lección</div>
              <button
                onClick={() => onNavigate(nextLesson.id, nextLesson.moduleId || '')}
                className="flex items-center justify-between text-left hover:text-primary transition-colors w-full"
              >
                <span className="text-sm font-medium">{nextLesson.title}</span>
                <ChevronRight className="h-4 w-4 ml-1 flex-shrink-0" />
              </button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default LessonSidebar;
