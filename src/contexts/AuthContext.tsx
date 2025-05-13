
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuthOperations } from '@/hooks/use-auth-operations';
import { handleEmailConfirmation } from '@/utils/auth-utils';
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const authOperations = useAuthOperations(navigate);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
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
              // Show success message
              toast({
                title: "Inicio de sesión exitoso",
                description: "Has iniciado sesión correctamente."
              });
              
              // Defer fetching user profile to avoid state conflicts
              setTimeout(() => {
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
              toast({
                title: "Sesión cerrada",
                description: "Has cerrado sesión correctamente."
              });
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
      } catch (error: any) {
        console.error("Auth initialization error:", error);
        toast({
          title: "Error de autenticación",
          description: "Ha ocurrido un error al inicializar la autenticación.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // No need to return a cleanup function here since we want the auth subscription to persist
  }, [navigate]);

  const value = {
    user,
    session,
    loading,
    ...authOperations
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
