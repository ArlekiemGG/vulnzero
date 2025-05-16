
import { supabase } from '@/integrations/supabase/client';
import type { ProgressResult } from '@/types/course-progress';

export async function fetchUserProgressData(courseId: string, userId: string): Promise<ProgressResult> {
  // Fetch course progress data
  const { data: progressData, error: progressError } = await supabase
    .from('user_course_progress')
    .select('progress_percentage, completed')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (progressError) throw progressError;

  // Fetch completed lessons - using type assertion to avoid deep type instantiation
  const lessonsResponse = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId);
    
  const lessonsData = lessonsResponse.data;
  const lessonsError = lessonsResponse.error;

  if (lessonsError) throw lessonsError;

  // Process and set data
  const progress = progressData?.progress_percentage || 0;
  const completedLessonsMap: Record<string, boolean> = {};
  const completedQuizzesMap: Record<string, boolean> = {};
  
  if (lessonsData) {
    lessonsData.forEach(item => {
      if (item.completed) {
        // Create lesson key using courseId and lessonId
        const lessonKey = `${courseId}:${item.lesson_id}`;
        completedLessonsMap[lessonKey] = true;
        
        // Check for quiz completion using a simple type assertion
        const lessonWithQuizData = item as { quiz_completed?: boolean };
        if (lessonWithQuizData.quiz_completed) {
          completedQuizzesMap[lessonKey] = true;
        }
      }
    });
  }

  return {
    progress,
    completedLessons: completedLessonsMap,
    completedQuizzes: completedQuizzesMap
  };
}

export async function markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<boolean> {
  // Check if the lesson is already marked as completed
  const { data: existingProgress } = await supabase
    .from('user_lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  
  if (existingProgress) {
    // Update existing record
    const result = await supabase
      .from('user_lesson_progress')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', existingProgress.id);
    
    if (result.error) throw result.error;
  } else {
    // Create new record
    const result = await supabase
      .from('user_lesson_progress')
      .insert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString()
      });
    
    if (result.error) throw result.error;
  }
  
  // Update course progress
  await updateCourseProgressData(userId, courseId);
  
  return true;
}

export async function saveQuizResults(
  userId: string, 
  courseId: string, 
  lessonId: string, 
  score: number, 
  answers: Record<string, number>
): Promise<boolean> {
  // Check if lesson progress already exists
  const { data: existingLesson } = await supabase
    .from('user_lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  
  const quizData = {
    completed: true,
    completed_at: new Date().toISOString(),
    quiz_completed: true,
    quiz_score: score,
    quiz_answers: answers,
    quiz_completed_at: new Date().toISOString()
  };
  
  if (existingLesson) {
    // Update existing record with quiz results
    const result = await supabase
      .from('user_lesson_progress')
      .update(quizData)
      .eq('id', existingLesson.id);
    
    if (result.error) throw result.error;
  } else {
    // Create new lesson progress record with quiz results
    const result = await supabase
      .from('user_lesson_progress')
      .insert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        ...quizData
      });
    
    if (result.error) throw result.error;
  }
  
  // Update course progress
  await updateCourseProgressData(userId, courseId);
  
  return true;
}

export async function updateCourseProgressData(userId: string, courseId: string): Promise<number> {
  // Count total lessons in the course based on user_lesson_progress records
  const totalLessonsResult = await supabase
    .from('user_lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);
  
  const totalLessonsCount = totalLessonsResult.count;
  if (totalLessonsResult.error) throw totalLessonsResult.error;
  
  // Calculate completed lessons
  const completedLessonsResult = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('completed', true);
  
  const completedLessonsData = completedLessonsResult.data;
  if (completedLessonsResult.error) throw completedLessonsResult.error;
  
  const totalLessons = totalLessonsCount || 0;
  const completedCount = completedLessonsData?.length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const completed = progressPercentage === 100;
  
  // Check if course progress record exists
  const { data: existingProgress } = await supabase
    .from('user_course_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
  
  const updateData = {
    progress_percentage: progressPercentage,
    completed,
    completed_at: completed ? new Date().toISOString() : null
  };
  
  if (existingProgress) {
    // Update existing record
    await supabase
      .from('user_course_progress')
      .update(updateData)
      .eq('id', existingProgress.id);
  } else {
    // Create new record
    await supabase
      .from('user_course_progress')
      .insert({
        user_id: userId,
        course_id: courseId,
        ...updateData,
        started_at: new Date().toISOString()
      });
  }
  
  return progressPercentage;
}
