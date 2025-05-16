import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Award, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface OnboardingAssessmentProps {
  onComplete: (level: string, recommendedCourseId: string) => void;
}

const questions: Question[] = [
  {
    id: 'q1',
    text: '¿Cuál es tu nivel de experiencia en ciberseguridad?',
    options: ['Ninguna experiencia', 'Principiante', 'Intermedio', 'Avanzado']
  },
  {
    id: 'q2',
    text: '¿Has trabajado con líneas de comandos o terminales?',
    options: ['Nunca', 'Raramente', 'Ocasionalmente', 'Frecuentemente']
  },
  {
    id: 'q3',
    text: '¿Conoces conceptos básicos de redes como IP, puertos, protocolos?',
    options: ['No conozco estos términos', 'Conozco algo básico', 'Tengo un buen conocimiento', 'Tengo conocimiento avanzado']
  },
  {
    id: 'q4',
    text: '¿Cuál de estas áreas te interesa más?',
    options: ['Fundamentos de seguridad', 'Hacking ético', 'Análisis de malware', 'Seguridad en redes']
  },
  {
    id: 'q5',
    text: '¿Has participado alguna vez en CTFs o desafíos de hacking?',
    options: ['Nunca', 'Una o dos veces', 'Varias veces', 'Regularmente']
  }
];

export function OnboardingAssessment({ onComplete }: OnboardingAssessmentProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    // Simple algorithm to determine level and recommended course
    const valueSum = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const averageScore = valueSum / questions.length;
    
    let level: string;
    let recommendedCourseId: string;
    
    if (averageScore < 1.5) {
      level = 'principiante';
      recommendedCourseId = 'fundamentos-cybersecurity';
    } else if (averageScore < 2.5) {
      level = 'intermedio';
      recommendedCourseId = 'hacking-etico';
    } else {
      level = 'avanzado';
      recommendedCourseId = 'analisis-malware';
    }
    
    setAssessmentComplete(true);
    
    // Save user preferences if logged in
    if (user) {
      saveUserPreferences(level, recommendedCourseId);
    }
    
    // Call the completion callback
    onComplete(level, recommendedCourseId);
  };
  
  const saveUserPreferences = async (level: string, recommendedCourseId: string) => {
    try {
      // Check if columns exist in profiles table and only update with them if they do
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
        updateObj.recommended_course = recommendedCourseId;
      }
      if (columnNames.includes('completed_assessment')) {
        updateObj.completed_assessment = true;
      }
      
      if (Object.keys(updateObj).length > 0) {
        await supabase
          .from('profiles')
          .update(updateObj)
          .eq('id', user.id);
      } else {
        console.warn('Profile table does not have required columns for learning preferences');
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  const goToCourse = (courseId: string) => {
    toast({
      title: "Curso recomendado",
      description: "Te estamos redirigiendo al curso recomendado según tu nivel"
    });
    navigate(`/courses/${courseId}`);
  };

  const currentQ = questions[currentQuestion];
  
  if (assessmentComplete) {
    // Determine values for the result screen based on answers
    const level = answers.q1 < 2 ? 'principiante' : answers.q1 < 3 ? 'intermedio' : 'avanzado';
    const courseId = level === 'principiante' ? 'fundamentos-cybersecurity' : 
                     level === 'intermedio' ? 'hacking-etico' : 'analisis-malware';
    const courseTitle = level === 'principiante' ? 'Fundamentos de Ciberseguridad' : 
                        level === 'intermedio' ? 'Hacking Ético' : 'Análisis de Malware';

    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <Award className="h-12 w-12 mx-auto mb-2 text-primary" />
          <CardTitle className="text-2xl">¡Evaluación Completada!</CardTitle>
          <CardDescription>Según tus respuestas, hemos determinado tu nivel y recomendación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Tu nivel recomendado:</h3>
            <div className="flex items-center">
              <div className={`w-full h-2.5 rounded-full bg-gray-200 ${
                level === 'principiante' ? 'bg-green-100' : 
                level === 'intermedio' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <div className={`h-2.5 rounded-full ${
                  level === 'principiante' ? 'bg-green-500 w-1/3' : 
                  level === 'intermedio' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-full'
                }`}></div>
              </div>
              <span className="ml-3 font-medium capitalize">{level}</span>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-2">Curso recomendado:</h3>
            <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{courseTitle}</div>
                <div className="text-sm text-muted-foreground">El mejor punto de partida para tu nivel</div>
              </div>
              <Button onClick={() => goToCourse(courseId)}>
                Empezar <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Ver todos los cursos
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Evaluación Inicial</CardTitle>
          <div className="text-sm text-muted-foreground">
            Pregunta {currentQuestion + 1} de {questions.length}
          </div>
        </div>
        <div className="w-full bg-muted h-2 rounded-full">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            {currentQ.text}
          </h3>
          <RadioGroup 
            value={answers[currentQ.id]?.toString()} 
            onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
            className="space-y-3"
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={nextQuestion} 
          disabled={answers[currentQ.id] === undefined}
        >
          {currentQuestion < questions.length - 1 ? 'Siguiente' : 'Finalizar'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default OnboardingAssessment;
