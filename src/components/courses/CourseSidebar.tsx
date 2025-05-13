
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BookOpen, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourseSection, CourseLesson, LessonProgress } from '@/services/CourseService';

interface CourseSidebarProps {
  sections: CourseSection[];
  lessons: Record<string, CourseLesson[]>;
  courseId: string;
  currentLessonId?: string;
  lessonProgress?: Record<string, LessonProgress>;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  sections,
  lessons,
  courseId,
  currentLessonId,
  lessonProgress = {},
}) => {
  const navigate = useNavigate();

  const handleLessonClick = (lessonId: string) => {
    navigate(`/tutorials/${courseId}/lesson/${lessonId}`);
  };

  // Calcular qué lecciones están bloqueadas
  const getIsLessonBlocked = (sectionIndex: number, lessonIndex: number) => {
    // La primera lección siempre está desbloqueada
    if (sectionIndex === 0 && lessonIndex === 0) return false;
    
    // Buscar la lección anterior
    let prevLessonId: string | null = null;
    
    if (lessonIndex > 0) {
      // Si no es la primera lección de la sección, la anterior es en la misma sección
      const sectionLessons = lessons[sections[sectionIndex].id] || [];
      prevLessonId = sectionLessons[lessonIndex - 1]?.id || null;
    } else if (sectionIndex > 0) {
      // Si es la primera lección de una sección (no la primera), buscar la última lección de la sección anterior
      const prevSectionLessons = lessons[sections[sectionIndex - 1].id] || [];
      prevLessonId = prevSectionLessons[prevSectionLessons.length - 1]?.id || null;
    }
    
    // Si no hay lección anterior, no está bloqueada
    if (!prevLessonId) return false;
    
    // Si la lección anterior está completada, esta lección no está bloqueada
    return !lessonProgress[prevLessonId]?.completed;
  };

  return (
    <aside className="w-full md:w-64 bg-cybersec-darkgray border-r border-cybersec-gray h-full overflow-y-auto">
      <div className="p-4 sticky top-0 bg-cybersec-darkgray z-10 border-b border-cybersec-gray">
        <h3 className="text-lg font-bold text-cybersec-neongreen">Contenido del curso</h3>
      </div>
      <div className="p-2">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="mb-4">
            <div className="px-3 py-2 bg-cybersec-black/50 rounded-md mb-1 flex items-center justify-between">
              <h4 className="text-sm font-medium text-cybersec-electricblue">{section.title}</h4>
              <ChevronRight className="h-4 w-4 text-cybersec-electricblue" />
            </div>
            <ul className="pl-2">
              {(lessons[section.id] || []).map((lesson, lessonIndex) => {
                const isActive = lesson.id === currentLessonId;
                const isCompleted = lessonProgress[lesson.id]?.completed;
                const isBlocked = getIsLessonBlocked(sectionIndex, lessonIndex);
                
                return (
                  <li key={lesson.id}>
                    <button
                      onClick={() => !isBlocked && handleLessonClick(lesson.id)}
                      className={cn(
                        "w-full px-3 py-2 my-1 rounded-md flex items-center justify-between text-left text-sm",
                        isActive 
                          ? "bg-cybersec-neongreen/10 text-cybersec-neongreen" 
                          : isBlocked 
                            ? "text-gray-500 cursor-not-allowed" 
                            : "text-gray-300 hover:bg-cybersec-black/30",
                      )}
                      disabled={isBlocked}
                    >
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : isBlocked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                        <span className="line-clamp-1">{lesson.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">{lesson.duration_minutes}m</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default CourseSidebar;
