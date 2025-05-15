import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGithub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean }>;
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
  const [isUserLogin, setIsUserLogin] = useState(false);
  const redirectInProgressRef = useRef(false);
  const authStateCheckedRef = useRef(false);
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
        .select('role, username')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      // Store username in localStorage for easy access
      if (data?.username) {
        localStorage.setItem('user_username', data.username);
      }
      
      setIsAdmin(data?.role === 'admin');
      return data?.role === 'admin';
    } catch (error) {
      console.error('Exception checking admin status:', error);
      return false;
    }
  };

  // Perform a safe navigation that prevents redirect loops
  const safeNavigate = (path: string) => {
    if (redirectInProgressRef.current || path === window.location.pathname) {
      return;
    }
    
    redirectInProgressRef.current = true;
    
    // Use setTimeout to ensure state updates complete before navigation
    setTimeout(() => {
      navigate(path);
      
      // Reset redirect flag after a delay to prevent rapid redirects
      setTimeout(() => {
        redirectInProgressRef.current = false;
      }, 500);
    }, 50);
  };

  useEffect(() => {
    const initAuth = async () => {
      if (authStateCheckedRef.current) {
        // Skip initialization if already done
        return;
      }
      
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
            
            // Handle specific events - only show notifications on explicit auth events, not page navigations
            if (event === 'SIGNED_IN' && currentSession?.user) {
              // Only show toast for user-initiated logins and if not already shown
              // AND if we're actually on the auth page (explicit login)
              if (isUserLogin && !notificationShown.signIn && window.location.pathname === '/auth') {
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
                  safeNavigate(redirectPath);
                }
              }, 0);
            }

            // Handle sign out event
            if (event === 'SIGNED_OUT') {
              // Clean up any remaining state
              setUser(null);
              setSession(null);
              setIsAdmin(false);
              
              // Also clear username from localStorage
              localStorage.removeItem('user_username');
              
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
        authStateCheckedRef.current = true;
        
        // Verificar rol de admin si hay usuario
        if (data.session?.user) {
          await checkAdminStatus(data.session.user.id);
        }
        
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
    return await signUp(email, password, username);
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
