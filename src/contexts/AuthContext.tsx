
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useRateLimit } from '@/components/Auth/RateLimitGuard';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { checkRateLimit, recordAttempt } = useRateLimit();
  const { logFailedAuth, logSuccessfulAuth } = useSecurityMonitoring();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Show toast notifications for auth events
        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          toast.info('Signed out');
          setIsAdmin(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if user is admin whenever the user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data ? true : false);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      }
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      // Check rate limit before attempting sign in
      if (!checkRateLimit(email, 'login')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      // Record the attempt
      recordAttempt(email, 'login', !error);

      if (error) {
        logFailedAuth(email, error.message);
        throw error;
      }

      if (user) {
        logSuccessfulAuth(user.id, 'email_password');
      }
    } catch (error: any) {
      logFailedAuth(email, error.message);
      toast.error(error.message || 'Error signing in');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Check rate limit before attempting sign up
      if (!checkRateLimit(email, 'signup')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      // Record the attempt
      recordAttempt(email, 'signup', !error);

      if (error) {
        logFailedAuth(email, error.message);
        throw error;
      }

      toast.success('Sign up successful! Please check your email for verification.');
    } catch (error: any) {
      logFailedAuth(email, error.message);
      toast.error(error.message || 'Error signing up');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AdminRedirectProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [initialRedirectDone, setInitialRedirectDone] = useState(false);

  useEffect(() => {
    // Only redirect on first login and authentication check
    if (!loading && user && isAdmin && !initialRedirectDone) {
      // Check if not already on an admin page or other protected pages
      const currentPath = window.location.pathname;
      const protectedPaths = ['/admin', '/keywords', '/rankings', '/all-websites', '/add-website', '/profile'];
      const isOnProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));
      
      // Only redirect to admin if on the home page
      if (currentPath === '/' && !isOnProtectedPath) {
        navigate('/admin/dashboard-rw');
      }
      setInitialRedirectDone(true);
    }
    
    // Reset the flag when user logs out
    if (!user) {
      setInitialRedirectDone(false);
    }
  }, [user, isAdmin, loading, navigate, initialRedirectDone]);

  return <>{children}</>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
