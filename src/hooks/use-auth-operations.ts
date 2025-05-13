
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { cleanupAuthState, checkPasswordStrength, isCommonPassword } from '@/utils/auth-utils';

export const useAuthOperations = (navigate: (path: string) => void) => {
  const [loading, setLoading] = useState(false);

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
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/dashboard`;
      
      console.log("Redirect URL:", redirectUrl);
      
      // Modificamos la llamada para usar opciones de redirección conforme a la API de supabase
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
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Redirigiendo al dashboard..."
      });
      
      // Redirigimos al usuario al dashboard después de iniciar sesión
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Complete login error:", error);
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "Credenciales incorrectas o cuenta no verificada",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      
      // Check password strength
      const passwordCheck = checkPasswordStrength(password);
      if (!passwordCheck.isStrong) {
        toast({
          title: "Contraseña débil",
          description: passwordCheck.message,
          variant: "destructive"
        });
        return;
      }

      // Check if password is commonly used
      if (isCommonPassword(password)) {
        toast({
          title: "Contraseña vulnerable",
          description: "Esta contraseña es demasiado común y puede ser fácilmente adivinada. Por favor, elija una contraseña más segura.",
          variant: "destructive"
        });
        return;
      }
      
      // Clean up existing state
      cleanupAuthState();
      
      // Obtén la URL completa actual para usar como base para la redirección
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/auth?verification=true`;
      
      console.log("Redirect URL for email verification:", redirectUrl);
      
      // Utilizando la función signUp sin requerir confirmación de correo electrónico
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username
          },
          // Usamos la URL completa para la redirección
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
      
      if (data?.user?.identities && data.user.identities.length === 0) {
        toast({
          title: "Usuario ya registrado",
          description: "Este correo electrónico ya está registrado. Por favor, inicia sesión.",
          variant: "default"
        });
        return;
      }
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Revisa tu correo para confirmar tu cuenta.",
      });
    } catch (error: any) {
      console.error("Error en el registro:", error);
      toast({
        title: "Error de registro",
        description: error.message || "Ha ocurrido un error durante el registro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGithub = async () => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Obtén la URL completa para la redirección
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/dashboard`;
      
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
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/dashboard`;
      
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
      }
      
      // Force page reload for a clean state
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Obtén la URL completa para la redirección
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/auth?type=recovery`;
      
      console.log("Reset password redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      
      toast({
        title: "Correo enviado",
        description: "Si existe una cuenta con este correo, recibirás instrucciones para restablecer tu contraseña.",
      });
    } catch (error: any) {
      toast({
        title: "Error al restablecer contraseña",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      // Check password strength
      const passwordCheck = checkPasswordStrength(newPassword);
      if (!passwordCheck.isStrong) {
        toast({
          title: "Contraseña débil",
          description: passwordCheck.message,
          variant: "destructive"
        });
        return;
      }

      // Check if password is commonly used
      if (isCommonPassword(newPassword)) {
        toast({
          title: "Contraseña vulnerable",
          description: "Esta contraseña es demasiado común y puede ser fácilmente adivinada. Por favor, elija una contraseña más segura.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Updating password...");
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error al actualizar contraseña",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    loading,
    signIn,
    signUp,
    signInWithGithub,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword
  };
};
