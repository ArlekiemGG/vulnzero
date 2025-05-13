
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuthOperations } from '@/hooks/use-auth-operations';
import { handleEmailConfirmation } from '@/utils/auth-utils';

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
    // Check for URL fragments and handle them
    handleEmailConfirmation(
      supabase,
      window.location.pathname,
      window.location.hash,
      window.location.search,
      navigate
    );

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
              // User's email has been verified
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
