
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuthOperations } from '@/hooks/use-auth-operations';
import { handleEmailConfirmation, cleanupAuthState } from '@/utils/auth-utils';
import { toast } from "@/components/ui/use-toast";

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
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Para evitar múltiples notificaciones
const notificationShown = {
  signIn: false,
  signOut: false
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialSessionChecked, setInitialSessionChecked] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isUserLogin, setIsUserLogin] = useState(false);
  const navigate = useNavigate();
  
  const { 
    loading: authLoading, 
    signIn, 
    signUp, 
    signInWithGithub,
    signInWithGoogle, 
    signOut, 
    resetPassword, 
    updatePassword 
  } = useAuthOperations(navigate);

  // Verificar si el usuario actual es administrador
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      setIsAdmin(data?.role === 'admin');
      return data?.role === 'admin';
    } catch (error) {
      console.error('Exception checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        console.log("Initializing authentication...");
        
        // Check for URL fragments and handle them
        handleEmailConfirmation(
          supabase,
          window.location.pathname,
          window.location.hash,
          window.location.search,
          navigate
        );

        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Auth state changed:", event);
            
            // Update session state
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            // Handle specific events
            if (event === 'SIGNED_IN' && currentSession?.user) {
              // Only show toast for user-initiated logins and if not already shown
              if (isUserLogin && !notificationShown.signIn) {
                notificationShown.signIn = true;
                // Reset the notification flag after some time
                setTimeout(() => {
                  notificationShown.signIn = false;
                }, 10000);
                
                toast({
                  title: "Inicio de sesión exitoso",
                  description: "Has iniciado sesión correctamente.",
                  variant: "success",
                  duration: 5000
                });
                setIsUserLogin(false);
              }
              
              // Defer fetching user profile to avoid state conflicts
              setTimeout(() => {
                // Verificar rol de admin
                checkAdminStatus(currentSession.user.id);
                
                // Ensure we redirect to dashboard on successful sign in
                const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboard';
                localStorage.removeItem('redirectAfterLogin');
                
                if (window.location.pathname === '/auth') {
                  navigate(redirectPath);
                }
              }, 0);
            }

            // Handle sign out event
            if (event === 'SIGNED_OUT') {
              // Clean up any remaining state
              setUser(null);
              setSession(null);
              setIsAdmin(false);
              
              if (!notificationShown.signOut) {
                notificationShown.signOut = true;
                // Reset the notification flag after some time
                setTimeout(() => {
                  notificationShown.signOut = false;
                }, 10000);
                
                toast({
                  title: "Sesión cerrada",
                  description: "Has cerrado sesión correctamente.",
                  duration: 5000,
                  variant: "default"
                });
              }
              
              // Limpiar estado de autenticación
              cleanupAuthState();
            }
          }
        );

        // Then check for existing session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setInitialSessionChecked(true);
        
        // Verificar rol de admin si hay usuario
        if (data.session?.user) {
          await checkAdminStatus(data.session.user.id);
        }
        
        // Mark auth as initialized - after this, auth state changes will trigger toasts
        setAuthInitialized(true);
      } catch (error: any) {
        console.error("Auth initialization error:", error);
        toast({
          title: "Error de autenticación",
          description: "Ha ocurrido un error al inicializar la autenticación.",
          variant: "destructive",
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  // Modify the signIn function to set a flag that indicates a user-initiated login
  const wrappedSignIn = async (email: string, password: string) => {
    notificationShown.signIn = false;
    setIsUserLogin(true);
    await signIn(email, password);
  };

  const wrappedSignUp = async (email: string, password: string, username: string) => {
    notificationShown.signIn = false;
    setIsUserLogin(true);
    await signUp(email, password, username);
  };

  const wrappedSignInWithGithub = async () => {
    notificationShown.signIn = false;
    setIsUserLogin(true);
    await signInWithGithub();
  };

  const wrappedSignInWithGoogle = async () => {
    notificationShown.signIn = false;
    setIsUserLogin(true);
    await signInWithGoogle();
  };

  const wrappedSignOut = async () => {
    notificationShown.signOut = false;
    await signOut();
  };

  const value = {
    user,
    session,
    loading: loading || authLoading,
    signIn: wrappedSignIn,
    signUp: wrappedSignUp,
    signInWithGithub: wrappedSignInWithGithub,
    signInWithGoogle: wrappedSignInWithGoogle,
    signOut: wrappedSignOut,
    resetPassword,
    updatePassword,
    isAdmin
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
