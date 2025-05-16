import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModuleMetadata, LessonMetadata } from '@/components/courses/types';
import { CheckIcon, LockIcon, PlayIcon, BookOpenIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserCourseProgress } from '@/hooks/use-course-progress';
import { useAuth } from '@/contexts/AuthContext';

interface SequentialCourseProgressProps {
  courseId: string;
  modules: ModuleMetadata[];
}

export function SequentialCourseProgress({ courseId, modules }: SequentialCourseProgressProps) {
  const { user } = useAuth();
  const [visibleModules, setVisibleModules] = useState<string[]>([]);
  const [visibleLessons, setVisibleLessons] = useState<Record<string, string[]>>({});
  const { progress, completedLessons, isLoading } = useUserCourseProgress(courseId, user?.id);

  // Initialize the first module and its first lesson as visible
  useEffect(() => {
    if (modules.length > 0) {
      const firstModule = modules[0];
      setVisibleModules([firstModule.id]);
      
      if (firstModule.lessons.length > 0) {
        setVisibleLessons({
          [firstModule.id]: [firstModule.lessons[0].id]
        });
      }
    }
  }, [modules]);

  // Update visible modules and lessons based on progress
  useEffect(() => {
    if (!isLoading && modules.length > 0) {
      updateVisibility();
    }
  }, [completedLessons, modules, isLoading]);

  const updateVisibility = () => {
    const newVisibleModules: string[] = [];
    const newVisibleLessons: Record<string, string[]> = {};
    
    let allPreviousComplete = true;
    
    // First module is always visible
    if (modules.length > 0) {
      newVisibleModules.push(modules[0].id);
    }
    
    for (const module of modules) {
      const moduleLessons = module.lessons;
      const visibleLessonIds: string[] = [];
      
      // If all previous modules are complete, this one is visible
      if (allPreviousComplete) {
        newVisibleModules.push(module.id);
        
        // Process lessons within this module
        let allPreviousLessonsComplete = true;
        for (const lesson of moduleLessons) {
          const lessonKey = `${courseId}:${lesson.id}`;
          const isCompleted = completedLessons[lessonKey] === true;
          
          // First lesson is always visible
          if (moduleLessons.indexOf(lesson) === 0) {
            visibleLessonIds.push(lesson.id);
          }
          // Otherwise, only visible if all previous lessons are complete
          else if (allPreviousLessonsComplete) {
            visibleLessonIds.push(lesson.id);
          }
          
          // Update tracking for next lesson
          if (!isCompleted) {
            allPreviousLessonsComplete = false;
          }
        }
        
        // Check if all lessons in this module are completed
        const allLessonsComplete = moduleLessons.every(
          lesson => completedLessons[`${courseId}:${lesson.id}`] === true
        );
        
        if (!allLessonsComplete) {
          allPreviousComplete = false;
        }
      }
      
      newVisibleLessons[module.id] = visibleLessonIds;
    }
    
    setVisibleModules(newVisibleModules);
    setVisibleLessons(newVisibleLessons);
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons[`${courseId}:${lessonId}`] === true;
  };

  const isLessonVisible = (moduleId: string, lessonId: string) => {
    return visibleLessons[moduleId]?.includes(lessonId) || false;
  };
  
  const isModuleCompleted = (moduleId: string) => {
    const moduleLessons = modules.find(m => m.id === moduleId)?.lessons || [];
    return moduleLessons.every(lesson => isLessonCompleted(lesson.id));
  };

  const getModuleProgress = (moduleId: string) => {
    const moduleLessons = modules.find(m => m.id === moduleId)?.lessons || [];
    if (moduleLessons.length === 0) return 0;
    
    const completedCount = moduleLessons.filter(lesson => isLessonCompleted(lesson.id)).length;
    return Math.round((completedCount / moduleLessons.length) * 100);
  };

  if (isLoading) {
    return <div className="text-center p-6">Cargando progreso del curso...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Overall progress card */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso del Curso</CardTitle>
          <CardDescription>
            {progress}% completado - {modules.filter(m => isModuleCompleted(m.id)).length} de {modules.length} módulos completados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2 mb-2" />
        </CardContent>
      </Card>
      
      {/* Module listing with sequential unlock */}
      <div className="space-y-6">
        {modules.map((module, moduleIndex) => {
          const isVisible = visibleModules.includes(module.id);
          const moduleProgress = getModuleProgress(module.id);
          
          return (
            <Card key={module.id} className={isVisible ? '' : 'opacity-50'}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <span>Módulo {moduleIndex + 1}: {module.title}</span>
                      {isModuleCompleted(module.id) && (
                        <CheckIcon className="ml-2 h-5 w-5 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription>{module.lessons.length} lecciones</CardDescription>
                  </div>
                  {!isVisible && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <LockIcon className="h-3 w-3" /> Bloqueado
                    </Badge>
                  )}
                </div>
                <Progress value={moduleProgress} className="h-1.5" />
              </CardHeader>
              
              {isVisible && (
                <CardContent className="space-y-2">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = isLessonCompleted(lesson.id);
                    const isVisible = isLessonVisible(module.id, lesson.id);
                    
                    return (
                      <div key={lesson.id}>
                        {lessonIndex > 0 && <Separator className="my-2" />}
                        <div className={`flex items-center justify-between py-2 ${!isVisible ? 'opacity-50' : ''}`}>
                          <div className="flex items-center">
                            {isCompleted ? (
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <CheckIcon className="h-4 w-4 text-green-600" />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full border flex items-center justify-center mr-3">
                                <span className="text-xs">{lessonIndex + 1}</span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-xs text-muted-foreground flex items-center">
                                <BookOpenIcon className="h-3 w-3 mr-1" />
                                {lesson.duration_minutes} min
                                {lesson.has_quiz && (
                                  <Badge variant="outline" className="ml-2 text-xs">Quiz</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isVisible ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              asChild
                            >
                              <Link to={`/courses/${courseId}/learn/${module.id}/${lesson.id}`}>
                                <PlayIcon className="h-4 w-4 mr-1" />
                                {isCompleted ? 'Repasar' : 'Comenzar'}
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              <LockIcon className="h-4 w-4 mr-1" />
                              Bloqueado
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default SequentialCourseProgress;
