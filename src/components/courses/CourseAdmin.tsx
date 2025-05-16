
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Database, RefreshCw, FileCheck, FileWarning } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseStructureInfo, validateCourseStructure, syncCourseWithDatabase, getAllCoursesStructureInfo } from '@/utils/course-structure-validator';

export function CourseAdmin() {
  const [courseStructures, setCourseStructures] = useState<CourseStructureInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingCourse, setSyncingCourse] = useState<string | null>(null);

  useEffect(() => {
    loadCourseStructures();
  }, []);

  const loadCourseStructures = async () => {
    setLoading(true);
    try {
      const structures = await getAllCoursesStructureInfo();
      setCourseStructures(structures);
    } catch (error) {
      console.error('Error loading course structures:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estructuras de los cursos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateSingleCourse = async (courseId: string) => {
    try {
      const courseInfo = await validateCourseStructure(courseId);
      if (courseInfo) {
        const updatedStructures = courseStructures.map(course => 
          course.id === courseId ? courseInfo : course
        );
        setCourseStructures(updatedStructures);
        toast({
          title: 'Validación completada',
          description: `Curso "${courseInfo.title}" validado con ${courseInfo.validLessons} lecciones válidas de ${courseInfo.lessonsCount}`
        });
      }
    } catch (error) {
      console.error(`Error validating course ${courseId}:`, error);
      toast({
        title: 'Error de validación',
        description: 'No se pudo validar el curso',
        variant: 'destructive'
      });
    }
  };

  const syncCourse = async (courseId: string) => {
    setSyncingCourse(courseId);
    try {
      await syncCourseWithDatabase(courseId);
      await validateSingleCourse(courseId);
    } catch (error) {
      console.error(`Error syncing course ${courseId}:`, error);
      toast({
        title: 'Error de sincronización',
        description: 'No se pudo sincronizar el curso con la base de datos',
        variant: 'destructive'
      });
    } finally {
      setSyncingCourse(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" /> Administración de Cursos
        </CardTitle>
        <CardDescription>
          Gestiona la estructura y sincronización de los cursos
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="structure">
          <TabsList className="mb-4">
            <TabsTrigger value="structure">Estructura</TabsTrigger>
            <TabsTrigger value="sync">Sincronización</TabsTrigger>
          </TabsList>
          
          <TabsContent value="structure">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Validación de Estructura</h3>
                <p className="text-sm text-muted-foreground">
                  Verifica que los archivos de contenido existan para todas las lecciones
                </p>
              </div>
              
              <Button onClick={loadCourseStructures} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">Cargando información de los cursos...</div>
            ) : (
              <div className="space-y-4">
                {courseStructures.map(course => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.modulesCount} módulos, {course.lessonsCount} lecciones
                        </p>
                      </div>
                      
                      <Badge variant={course.validLessons === course.lessonsCount ? "success" : "destructive"}>
                        {course.validLessons}/{course.lessonsCount} lecciones válidas
                      </Badge>
                    </div>
                    
                    {course.missingLessons.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center">
                            <FileWarning className="h-4 w-4 mr-1 text-amber-500" />
                            Lecciones con archivos faltantes:
                          </h5>
                          <ul className="text-sm space-y-1">
                            {course.missingLessons.map(missing => (
                              <li key={`${missing.moduleId}-${missing.lessonId}`} className="text-muted-foreground">
                                /courses/{course.id}/{missing.moduleId}/{missing.lessonId}.html
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => validateSingleCourse(course.id)}
                      >
                        Validar curso
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sync">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sincronización con Base de Datos</AlertTitle>
              <AlertDescription>
                La sincronización actualizará la base de datos con la estructura actual de los cursos desde los archivos de configuración.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {courseStructures.map(course => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileCheck className="h-4 w-4 mr-1" />
                        {course.validLessons} archivos de lecciones verificados
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => syncCourse(course.id)}
                      disabled={syncingCourse === course.id}
                    >
                      {syncingCourse === course.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Sincronizar con DB
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          La sincronización ayuda a mantener los cursos visibles en la plataforma incluso cuando los archivos de contenido no están disponibles.
        </div>
      </CardFooter>
    </Card>
  );
}

export default CourseAdmin;
