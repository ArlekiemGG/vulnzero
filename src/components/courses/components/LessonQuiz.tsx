
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';
import { QuizQuestion } from '../types';

interface LessonQuizProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  onComplete: (score: number, answers: Record<string, number>) => void;
  completed?: boolean;
}

const LessonQuiz = ({ courseId, moduleId, lessonId, onComplete, completed }: LessonQuizProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const quizPath = `/courses/${courseId}/${moduleId}/${lessonId}-quiz.json`;
        const response = await fetch(quizPath);
        
        if (!response.ok) {
          throw new Error('No se pudo cargar el quiz');
        }
        
        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('No se pudo cargar el quiz para esta lección');
      } finally {
        setLoading(false);
      }
    };

    if (!completed) {
      fetchQuiz();
    } else {
      setSubmitted(true);
    }
  }, [courseId, moduleId, lessonId, completed]);

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (submitted) return; // Don't allow changes after submission
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    
    questions.forEach(question => {
      if (answers[question.id] === question.correctOption) {
        correctCount++;
      }
    });
    
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    
    // Mark as submitted
    setSubmitted(true);
    
    // Call callback
    onComplete(score, answers);
  };

  const isComplete = () => {
    return questions.length > 0 && questions.every(q => answers[q.id] !== undefined);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Cargando quiz...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (completed) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium">¡Quiz completado!</h3>
          <p className="text-gray-500">Ya has completado este quiz.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <Card key={question.id} className="overflow-hidden">
          <CardContent className="p-6">
            <h4 className="text-lg font-medium mb-4">
              {index + 1}. {question.question}
            </h4>
            
            <RadioGroup 
              value={answers[question.id]?.toString()} 
              className="space-y-3"
              onValueChange={(value) => handleSelectAnswer(question.id, parseInt(value))}
            >
              {question.options.map((option, i) => (
                <div 
                  key={i} 
                  className={`flex items-center space-x-2 p-3 rounded-md border ${
                    submitted ? 
                      i === question.correctOption ? 'bg-green-50 border-green-200' : 
                      answers[question.id] === i ? 'bg-red-50 border-red-200' : 'border-gray-200' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem value={i.toString()} id={`${question.id}-option-${i}`} disabled={submitted} />
                  <Label htmlFor={`${question.id}-option-${i}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                  {submitted && i === question.correctOption && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {submitted && answers[question.id] === i && i !== question.correctOption && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </RadioGroup>
            
            {submitted && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="font-medium text-blue-700">Explicación:</p>
                <p className="text-blue-600">{question.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {!submitted && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={!isComplete()}
          >
            Enviar respuestas
          </Button>
        </div>
      )}
      
      {submitted && (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Quiz completado</h3>
            <p className="text-gray-500">
              Has respondido correctamente {
                questions.filter(q => answers[q.id] === q.correctOption).length
              } de {questions.length} preguntas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LessonQuiz;
