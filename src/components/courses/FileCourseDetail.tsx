
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { findCourseById } from '@/data/courses';
import { CourseMetadata } from './types';
import { CheckCircle, BookOpen, Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Circle, ChevronRight } from 'lucide-react';
import { useUserCourseProgress } from '@/hooks/use-course-progress';
import { useAuth } from '@/contexts/AuthContext';

interface FileCourseDetailProps {
  courseId: string;
}

const FileCourseDetail = ({ courseId }: FileCourseDetailProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseMetadata | null>(null);
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  const { 
    progress, 
    completedLessons, 
    isLoading: progressLoading 
  } = useUserCourseProgress(courseId, user?.id);

  useEffect(() => {
    const courseData = findCourseById(courseId);
    if (courseData) {
      setCourse(courseData);
      setTimeout(() => setFadeIn(true), 100);
    }
  }, [courseId]);

  const getTotalLessons = useCallback(() => {
    if (!course) return 0;
    return course.modules.reduce((total, module) => total + module.lessons.length, 0);
  }, [course]);

  const getCompletedLessonsCount = useCallback(() => {
    if (!completedLessons) return 0;
    return Object.values(completedLessons).filter(Boolean).length;
  }, [completedLessons]);

  const handleStartCourse = useCallback(() => {
    if (course && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      const firstModule = course.modules[0];
      const firstLesson = firstModule.lessons[0];
      navigate(`/courses/${course.id}/${firstModule.id}/${firstLesson.id}`);
    }
  }, [course, navigate]);

  const handleContinueCourse = useCallback(() => {
    if (!course) return;

    // Find first incomplete lesson
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        const lessonKey = `${course.id}:${module.id}:${lesson.id}`;
        if (!completedLessons || !completedLessons[lessonKey]) {
          navigate(`/courses/${course.id}/${module.id}/${lesson.id}`);
          return;
        }
      }
    }

    // If all lessons are completed, go to first lesson
    if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      const firstModule = course.modules[0];
      const firstLesson = firstModule.lessons[0];
      navigate(`/courses/${course.id}/${firstModule.id}/${firstLesson.id}`);
    }
  }, [course, completedLessons, navigate]);

  if (!course) {
    return null;
  }

  return (
    <div className={`container px-4 py-8 mx-auto transition-opacity duration-700 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-2/3">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
            <div className="flex items-center text-gray-400 mb-4">
              <span className="mr-4">{course.category}</span>
              <span className="mr-4">•</span>
              <span className="capitalize">{course.level}</span>
              <span className="mr-4">•</span>
              <span>{Math.floor(course.duration_minutes / 60)} horas {course.duration_minutes % 60} minutos</span>
            </div>
            <p className="text-gray-300">Instructor: {course.instructor}</p>
          </div>
          
          <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden">
            <img 
              src={course.image_url || "/placeholder.svg"} 
              alt={course.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <Tabs defaultValue="contenido">
            <TabsList className="mb-4">
              <TabsTrigger value="contenido">Contenido</TabsTrigger>
              <TabsTrigger value="descripcion">Descripción</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contenido" className="space-y-4">
              <h2 className="text-2xl font-bold">Contenido del curso</h2>
              
              <Accordion type="single" collapsible className="w-full">
                {course.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id} className="border rounded-lg mb-4 overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                          <span className="font-semibold">{module.title}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{module.lessons.length} lecciones</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0">
                      <div className="divide-y">
                        {module.lessons.map((lesson) => {
                          const lessonKey = `${course.id}:${module.id}:${lesson.id}`;
                          const isCompleted = completedLessons ? !!completedLessons[lessonKey] : false;
                          
                          return (
                            <div 
                              key={lesson.id} 
                              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => navigate(`/courses/${course.id}/${module.id}/${lesson.id}`)}
                            >
                              <div className="mr-3">
                                {isCompleted ? (
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
                                  {lesson.has_quiz && (
                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Quiz</span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="descripcion">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                <p className="text-gray-300 whitespace-pre-line">{course.description}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar with progress */}
        <div className="w-full md:w-1/3">
          <Card className="sticky top-24">
            <CardContent className="p-0">
              <div className="p-6">
                {progress > 0 ? (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tu progreso</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 mb-1" />
                    <p className="text-sm text-gray-500">
                      {getCompletedLessonsCount()} de {getTotalLessons()} lecciones completadas
                    </p>
                  </div>
                ) : user ? (
                  <div className="text-center mb-6">
                    <Circle className="h-12 w-12 mx-auto text-primary mb-2" />
                    <p className="font-medium">Aún no has comenzado este curso</p>
                    <p className="text-sm text-gray-500 mb-4">¡Empieza ahora para registrar tu progreso!</p>
                  </div>
                ) : (
                  <div className="text-center mb-6">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="font-medium">Inicia sesión para registrar tu progreso</p>
                  </div>
                )}
                
                <Button 
                  className="w-full flex items-center justify-center mb-4" 
                  onClick={progress > 0 ? handleContinueCourse : handleStartCourse}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {progress > 0 ? 'Continuar aprendizaje' : 'Comenzar curso'}
                </Button>
                
                {!user && (
                  <p className="text-sm text-center text-gray-500">
                    Inicia sesión para guardar tu progreso
                  </p>
                )}
              </div>
              
              <hr className="border-gray-200" />
              
              <div className="p-6">
                <h3 className="font-semibold mb-4">Este curso incluye:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <BookOpen className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <span>{getTotalLessons()} lecciones</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <span>{Math.floor(course.duration_minutes / 60)} horas {course.duration_minutes % 60} minutos de contenido</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <span>Certificado de finalización</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileCourseDetail;
