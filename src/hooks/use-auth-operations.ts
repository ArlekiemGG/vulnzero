
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { cleanupAuthState, checkPasswordStrength, isCommonPassword, getSiteURL } from '@/utils/auth-utils';

export const useAuthOperations = (navigate: (path: string) => void) => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
    email?: string;
    username?: string;
  }>({});

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up existing state
      cleanupAuthState();
      
      console.log("Starting login process for:", email);
      
      // Attempt global sign out first to avoid conflicting sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Global sign out during login failed, continuing anyway");
      }
      
      // Usar el origen completo para redirección
      const redirectUrl = `${getSiteURL()}/dashboard`;
      
      console.log("Redirect URL:", redirectUrl);
      
      // Inicio de sesión con email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email, 
        password,
      });
      
      if (error) {
        console.error("Login error from Supabase:", error);
        throw error;
      }
      
      console.log("Sign in response:", data);
      
      // Verificación de correo electrónico
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Correo no verificado",
          description: "Por favor, verifica tu correo electrónico antes de iniciar sesión.",
          variant: "destructive",
          duration: 5000
        });
        return;
      }
      
      // No mostramos toast aquí ya que se mostrará en el AuthContext cuando detecte el cambio de estado
      
      // Redirigimos al usuario al dashboard después de iniciar sesión
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Complete login error:", error);
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "Credenciales incorrectas o cuenta no verificada",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      setValidationErrors({});
      
      // Check password strength first before any API calls
      const passwordCheck = checkPasswordStrength(password);
      if (!passwordCheck.isStrong) {
        setValidationErrors(prev => ({ ...prev, password: passwordCheck.message }));
        toast({
          title: "Contraseña débil",
          description: passwordCheck.message,
          variant: "destructive"
        });
        return { success: false, error: 'password_validation' };
      }

      // Check if password is commonly used
      if (isCommonPassword(password)) {
        setValidationErrors(prev => ({ ...prev, password: "Esta contraseña es demasiado común y puede ser fácilmente adivinada" }));
        toast({
          title: "Contraseña vulnerable",
          description: "Esta contraseña es demasiado común y puede ser fácilmente adivinada. Por favor, elija una contraseña más segura.",
          variant: "destructive"
        });
        return { success: false, error: 'password_common' };
      }
      
      // Clean up existing state
      cleanupAuthState();
      
      // Obtén la URL completa para la redirección
      const siteUrl = getSiteURL();
      const redirectUrl = `${siteUrl}/auth?verification=true`;
      
      console.log("Redirect URL for email verification:", redirectUrl);

      try {
        // Utilizando la función signUp con confirmación de correo electrónico
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username
            },
            emailRedirectTo: redirectUrl
          }
        });
        
        if (error) {
          console.error("Error en registro:", error);
          toast({
            title: "Error de registro",
            description: error.message || "Ha ocurrido un error durante el registro",
            variant: "destructive"
          });
          return { success: false, error: error.message };
        }
        
        console.log("Sign up response:", data);
        
        // Verifica si el usuario ya existe por el tamaño del array identities
        if (data?.user?.identities && data.user.identities.length === 0) {
          toast({
            title: "Usuario ya registrado",
            description: "Este correo electrónico ya está registrado. Por favor, inicia sesión.",
            variant: "default"
          });
          return { success: false, error: 'already_exists' };
        }
        
        // Solo mostrar toast de éxito si llegamos hasta aquí (todo ha ido bien)
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Revisa tu correo para confirmar tu cuenta.",
        });
        
        return { success: true };
      } catch (apiError: any) {
        console.error("Error en la API de registro:", apiError);
        toast({
          title: "Error en el servidor",
          description: "Ha ocurrido un error durante el registro. Por favor, inténtalo de nuevo más tarde.",
          variant: "destructive"
        });
        return { success: false, error: apiError.message };
      }
    } catch (error: any) {
      console.error("Error general en el registro:", error);
      toast({
        title: "Error de registro",
        description: error.message || "Ha ocurrido un error durante el registro",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGithub = async () => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Obtén la URL completa para la redirección
      const redirectUrl = `${getSiteURL()}/dashboard`;
      
      console.log("GitHub redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error iniciando sesión con GitHub",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Obtén la URL completa para la redirección
      const redirectUrl = `${getSiteURL()}/dashboard`;
      
      console.log("Google redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error iniciando sesión con Google",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
        console.log("Error during sign out:", err);
      }
      
      // No mostramos toast aquí ya que se mostrará en el AuthContext cuando detecte el cambio de estado
      
      // Force page reload for a clean state
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Obtén la URL completa para la redirección
      const redirectUrl = `${getSiteURL()}/auth?type=recovery`;
      
      console.log("Reset password redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      
      toast({
        title: "Correo enviado",
        description: "Si existe una cuenta con este correo, recibirás instrucciones para restablecer tu contraseña.",
        duration: 5000
      });
    } catch (error: any) {
      toast({
        title: "Error al restablecer contraseña",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      // Check password strength
      const passwordCheck = checkPasswordStrength(newPassword);
      if (!passwordCheck.isStrong) {
        setValidationErrors(prev => ({ ...prev, password: passwordCheck.message }));
        toast({
          title: "Contraseña débil",
          description: passwordCheck.message,
          variant: "destructive",
          duration: 5000
        });
        return { success: false };
      }

      // Check if password is commonly used
      if (isCommonPassword(newPassword)) {
        setValidationErrors(prev => ({ ...prev, password: "Esta contraseña es demasiado común" }));
        toast({
          title: "Contraseña vulnerable",
          description: "Esta contraseña es demasiado común y puede ser fácilmente adivinada. Por favor, elija una contraseña más segura.",
          variant: "destructive",
          duration: 5000
        });
        return { success: false };
      }
      
      console.log("Updating password...");
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
        duration: 5000,
        variant: "success"
      });
      
      navigate('/dashboard');
      return { success: true };
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error al actualizar contraseña",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
      return { success: false };
    }
  };

  return {
    loading,
    validationErrors,
    signIn,
    signUp,
    signInWithGithub,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword
  };
};
