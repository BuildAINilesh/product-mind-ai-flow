
import { createContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Debug auth state
  useEffect(() => {
    console.log("Current auth state:", { 
      user: user ? "User exists" : "No user", 
      session: session ? "Session exists" : "No session", 
      loading, 
      initialAuthCheckDone, 
      currentPath: location.pathname 
    });
  }, [user, session, loading, initialAuthCheckDone, location.pathname]);

  useEffect(() => {
    console.log("AuthProvider mounted");
    let subscription: { unsubscribe: () => void };

    async function setupAuth() {
      try {
        // Set up auth state listener first
        const authListener = supabase.auth.onAuthStateChange((event, currentSession) => {
          console.log(`Auth state change event: ${event}`);
          
          // Update session and user state
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);

          // Only navigate on explicit sign in/out events, not on token refresh or window focus
          if (initialAuthCheckDone) {
            if (event === 'SIGNED_IN') {
              // Only redirect to dashboard if not already on a dashboard route
              const isDashboardRoute = location.pathname.startsWith('/dashboard');
              if (!isDashboardRoute) {
                navigate('/dashboard');
                toast({
                  title: "Welcome back!",
                  description: "You have successfully signed in.",
                });
              }
            }
            if (event === 'SIGNED_OUT') {
              navigate('/');
              toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
              });
            }
          }
        });

        subscription = authListener.data.subscription;

        // Then check for existing session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }
        
        console.log("Initial session check:", data.session ? "Session found" : "No session");
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
        setInitialAuthCheckDone(true);
      } catch (error) {
        console.error("Error in auth setup:", error);
        setLoading(false);
        setInitialAuthCheckDone(true);
      }
    }

    setupAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate, toast, location.pathname]);

  // Update initialAuthCheckDone separately
  useEffect(() => {
    if (initialAuthCheckDone) {
      console.log("Initial auth check complete, current path:", location.pathname);
      // If user is authenticated and on login page, redirect to dashboard
      if (session && (location.pathname === '/login' || location.pathname === '/register')) {
        navigate('/dashboard');
      }
    }
  }, [initialAuthCheckDone, session, location.pathname, navigate]);

  const signIn = async (email: string, password: string): Promise<void> => {
    console.log("Attempting sign in with:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    
    // We don't need to return data as the auth state will be updated via the onAuthStateChange event
    console.log("Sign in successful:", data);
    // Not returning anything explicitly to match the Promise<void> return type
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } else {
      toast({
        title: "Welcome!",
        description: "Please check your email to verify your account.",
      });
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
