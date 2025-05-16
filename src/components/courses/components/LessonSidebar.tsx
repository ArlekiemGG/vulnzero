
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  currentLesson: { title: string };
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  onNavigate: (id: string) => void;
}

const LessonSidebar = ({ currentLesson, prevLesson, nextLesson, onNavigate }: SidebarProps) => {
  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4">Navegación rápida</h3>
        
        {prevLesson && (
          <>
            <div className="mb-3">
              <div className="text-sm text-gray-500">Anterior</div>
              <button 
                onClick={() => onNavigate(prevLesson.id)}
                className="text-left font-medium hover:text-primary transition-colors"
              >
                {prevLesson.title}
              </button>
            </div>
            <Separator className="my-3" />
          </>
        )}
        
        <div className="mb-3">
          <div className="text-sm text-gray-500">Actual</div>
          <div className="font-medium text-primary">{currentLesson.title}</div>
        </div>
        
        {nextLesson && (
          <>
            <Separator className="my-3" />
            <div>
              <div className="text-sm text-gray-500">Siguiente</div>
              <button 
                onClick={() => onNavigate(nextLesson.id)}
                className="text-left font-medium hover:text-primary transition-colors"
              >
                {nextLesson.title}
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonSidebar;
