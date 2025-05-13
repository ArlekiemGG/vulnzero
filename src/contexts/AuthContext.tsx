
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

// Utility function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Password strength checker
const checkPasswordStrength = (password: string): { isStrong: boolean, message: string } => {
  // Check if password is at least 8 characters long
  if (password.length < 8) {
    return { isStrong: false, message: "La contraseña debe tener al menos 8 caracteres" };
  }

  // Check if password has at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos una letra mayúscula" };
  }

  // Check if password has at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos una letra minúscula" };
  }

  // Check if password has at least one number
  if (!/\d/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos un número" };
  }

  // Check if password has at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isStrong: false, message: "La contraseña debe incluir al menos un carácter especial" };
  }

  // Password is strong
  return { isStrong: true, message: "Contraseña segura" };
};

// Check for common passwords (a basic solution since we can't use HaveIBeenPwned)
const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty', 
    'admin', 'welcome', 'letmein', 'monkey', 'abc123', 
    'iloveyou', '1234567', '1234567890', 'password1', '12345678',
    'baseball', 'football', 'superman', 'starwars', 'jennifer',
    'michael', 'shadow', 'batman', 'dragon', 'master'
  ];
  
  // Case insensitive check
  return commonPasswords.some(commonPwd => 
    commonPwd.toLowerCase() === password.toLowerCase());
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a hash fragment indicating email confirmation
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;
      const query = window.location.search;
      const path = window.location.pathname;
      
      console.log("Current URL state:", { path, hash, query });
      
      // Check if we have an access_token in the URL (email confirmation)
      if (hash && hash.includes('access_token=')) {
        try {
          // The hash contains the access_token which Supabase will handle automatically
          // We just need to check if it sets up the session correctly
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data.session) {
            toast({
              title: "Email verificado",
              description: "Tu correo ha sido verificado correctamente. Ahora puedes iniciar sesión.",
              variant: "default"
            });
            
            // Redirect to dashboard if user is confirmed
            navigate('/dashboard');
          }
        } catch (error: any) {
          console.error("Email verification error:", error);
          toast({
            title: "Error de verificación",
            description: "No se pudo verificar tu correo electrónico. Por favor, intenta iniciar sesión o solicita un nuevo enlace de verificación.",
            variant: "destructive"
          });
        }
      }
      
      // Check for password reset flow
      if (query && query.includes('type=recovery')) {
        console.log("Detected recovery flow");
        // Redirect to reset password page maintaining the query parameters
        navigate(`/auth${query}`);
      }
    };

    handleEmailConfirmation();

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // Handle specific events
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Defer profile fetching to avoid deadlock
          setTimeout(() => {
            toast({
              title: "Acceso exitoso",
              description: "Bienvenido de nuevo, hacker.",
            });
            
            // Ensure we redirect to dashboard on successful sign in
            if (window.location.pathname === '/auth') {
              navigate('/dashboard');
            }
          }, 0);
        }

        // Handle sign out event
        if (event === 'SIGNED_OUT') {
          // Clean up any remaining state
          setUser(null);
          setSession(null);
        }
        
        // Handle user updated event (email verification)
        if (event === 'USER_UPDATED') {
          try {
            const { data } = await supabase.auth.getUser();
            if (data?.user && data.user.email_confirmed_at) {
              toast({
                title: "Correo verificado",
                description: "Tu correo electrónico ha sido verificado correctamente.",
              });
            }
          } catch (error) {
            console.error("Error checking email confirmation:", error);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out first to avoid conflicting sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Usar el origen completo para redirección
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/dashboard`;
      console.log("Login redirect URL:", redirectUrl);
      
      // Modificamos la llamada para usar opciones de redirección
      const { data, error } = await supabase.auth.signInWithPassword({
        email, 
        password,
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
      
      // Verificación de correo electrónico
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Correo no verificado",
          description: "Por favor, verifica tu correo electrónico antes de iniciar sesión.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Login successful, redirecting to dashboard");
      // Usamos la URL completa para la redirección
      window.location.href = `${currentOrigin}/dashboard`;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "Credenciales incorrectas o cuenta no verificada",
        variant: "destructive"
      });
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
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
      
      // No redirigimos, dejamos al usuario en la página de autenticación
      // hasta que confirme su correo electrónico
    } catch (error: any) {
      console.error("Error en el registro:", error);
      toast({
        title: "Error de registro",
        description: error.message || "Ha ocurrido un error durante el registro",
        variant: "destructive"
      });
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

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGithub,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
