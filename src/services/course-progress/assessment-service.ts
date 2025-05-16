
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface AssessmentStatus {
  completed: boolean;
  recommendedCourse?: string;
  preferredLevel?: string;
}

export const AssessmentService = {
  /**
   * Verifica el estado de la evaluación del usuario
   */
  async getUserAssessmentStatus(userId: string): Promise<AssessmentStatus | null> {
    try {
      console.log("Consultando estado de evaluación para:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('completed_assessment, preferred_level, recommended_course')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error al obtener estado de evaluación:', error);
        return null;
      }
      
      console.log("Datos de evaluación:", data);
      
      return {
        completed: Boolean(data?.completed_assessment),
        preferredLevel: data?.preferred_level || undefined,
        recommendedCourse: data?.recommended_course || undefined
      };
    } catch (error) {
      console.error('Error en getUserAssessmentStatus:', error);
      return null;
    }
  },
  
  /**
   * Establece el estado de la evaluación como completada
   */
  async completeAssessment(userId: string, preferredLevel: string, recommendedCourse: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          completed_assessment: true,
          preferred_level: preferredLevel,
          recommended_course: recommendedCourse
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Evaluación completada",
        description: "Tu perfil ha sido actualizado con tus preferencias",
        variant: "success"
      });
      
      return true;
    } catch (error) {
      console.error('Error al completar la evaluación:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la evaluación",
        variant: "destructive"
      });
      return false;
    }
  },
  
  /**
   * Reinicia el estado de la evaluación del usuario para pruebas
   */
  async resetAssessment(userId: string): Promise<boolean> {
    try {
      console.log("Reiniciando evaluación para:", userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          completed_assessment: false,
          preferred_level: null,
          recommended_course: null
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Evaluación reiniciada",
        description: "Puedes volver a realizar la evaluación inicial",
        variant: "success"
      });
      
      return true;
    } catch (error) {
      console.error('Error al reiniciar la evaluación:', error);
      toast({
        title: "Error",
        description: "No se pudo reiniciar la evaluación",
        variant: "destructive"
      });
      return false;
    }
  }
};
