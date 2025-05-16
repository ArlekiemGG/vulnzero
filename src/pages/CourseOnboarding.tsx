
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/use-user-stats';
import { OnboardingAssessment } from '@/components/courses/OnboardingAssessment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Lightbulb, Route } from 'lucide-react';

const CourseOnboarding = () => {
  const { user } = useAuth();
  const { userStats } = useUserStats(user?.id);
  const navigate = useNavigate();
  const [completedAssessment, setCompletedAssessment] = useState<boolean>(false);
  const [level, setLevel] = useState<string>('');
  const [recommendedCourseId, setRecommendedCourseId] = useState<string>('');
  
  useEffect(() => {
    document.title = "Evaluación inicial - VulnZero";
    
    // Check if user has completed assessment before
    if (user) {
      checkUserAssessment();
    }
  }, [user]);
  
  const checkUserAssessment = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && profile) {
        // Safely check if properties exist before accessing them
        setCompletedAssessment('completed_assessment' in profile ? !!profile.completed_assessment : false);
        setLevel('preferred_level' in profile ? profile.preferred_level || '' : '');
        setRecommendedCourseId('recommended_course' in profile ? profile.recommended_course || '' : '');
      }
    } catch (error) {
      console.error('Error checking user assessment:', error);
    }
  };
  
  const handleAssessmentComplete = async (level: string, courseId: string) => {
    setLevel(level);
    setRecommendedCourseId(courseId);
    setCompletedAssessment(true);
    
    // Update user profile with assessment results
    if (user) {
      try {
        // Check if columns exist in profiles table before updating
        const { data: columns } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', 'profiles')
          .eq('table_schema', 'public');
        
        const columnNames = columns?.map(c => c.column_name) || [];
        const updateObj: Record<string, any> = {};
        
        // Only add fields if they exist in the database
        if (columnNames.includes('preferred_level')) {
          updateObj.preferred_level = level;
        }
        if (columnNames.includes('recommended_course')) {
          updateObj.recommended_course = courseId;
        }
        if (columnNames.includes('completed_assessment')) {
          updateObj.completed_assessment = true;
        }
        
        if (Object.keys(updateObj).length > 0) {
          await supabase
            .from('profiles')
            .update(updateObj)
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error updating user profile with assessment results:', error);
      }
    }
  };
  
  const handleSkipAssessment = () => {
    navigate('/courses');
  };
  
  return (
    <div className="min-h-screen bg-cybersec-black">
      <Navbar />
      {user && <Sidebar userStats={userStats} />}
      
      <main className={`pt-16 pb-8 ${user ? 'md:pl-64' : ''}`}>
        <div className="container px-4 py-8 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Comienza tu viaje en ciberseguridad</h1>
              <p className="text-gray-400">
                Responde algunas preguntas para personalizar tu experiencia y recibir recomendaciones de cursos
              </p>
            </div>
            
            {completedAssessment ? (
              <Card>
                <CardHeader className="text-center">
                  <Route className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <CardTitle>¡Evaluación completada!</CardTitle>
                  <CardDescription>Hemos determinado tu ruta de aprendizaje ideal</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="bg-muted rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/20 p-3 rounded-full">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Tu nivel: <span className="capitalize">{level}</span></h3>
                        <p className="text-muted-foreground">
                          Hemos personalizado tu experiencia en base a tu nivel actual de conocimientos.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/20 p-3 rounded-full">
                        <Lightbulb className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Recomendaciones personalizadas</h3>
                        <p className="text-muted-foreground mb-4">
                          Basándonos en tu nivel, te recomendamos comenzar con los siguientes cursos:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {recommendedCourseId === 'fundamentos-cybersecurity' && (
                            <>
                              <Button onClick={() => navigate('/courses/fundamentos-cybersecurity')}>
                                Fundamentos de Ciberseguridad
                              </Button>
                              <Button variant="outline" onClick={() => navigate('/courses/hacking-etico')}>
                                Hacking Ético
                              </Button>
                            </>
                          )}
                          
                          {recommendedCourseId === 'hacking-etico' && (
                            <>
                              <Button onClick={() => navigate('/courses/hacking-etico')}>
                                Hacking Ético
                              </Button>
                              <Button variant="outline" onClick={() => navigate('/courses/analisis-malware')}>
                                Análisis de Malware
                              </Button>
                            </>
                          )}
                          
                          {recommendedCourseId === 'analisis-malware' && (
                            <>
                              <Button onClick={() => navigate('/courses/analisis-malware')}>
                                Análisis de Malware
                              </Button>
                              <Button variant="outline" onClick={() => navigate('/courses/hacking-etico')}>
                                Hacking Ético
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/courses')}
                  >
                    Ver todos los cursos
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="space-y-6">
                <OnboardingAssessment onComplete={handleAssessmentComplete} />
                
                <div className="text-center">
                  <Button variant="ghost" onClick={handleSkipAssessment}>
                    Saltar evaluación
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseOnboarding;
