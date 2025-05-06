
import { createContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

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
  const { toast: uiToast } = useToast();

  // Debug auth state
  useEffect(() => {
    console.log("Current auth state:", { 
      user: user ? `User exists (${user.email})` : "No user", 
      session: session ? `Session exists (expires: ${new Date(session.expires_at! * 1000).toLocaleString()})` : "No session", 
      loading, 
      initialAuthCheckDone, 
      currentPath: location.pathname 
    });
    
    // Check token expiration
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      console.log(`Token expires at: ${expiresAt.toLocaleString()}, Current time: ${now.toLocaleString()}, Valid: ${expiresAt > now}`);
    }
  }, [user, session, loading, initialAuthCheckDone, location.pathname]);

  useEffect(() => {
    console.log("AuthProvider mounted, setting up auth...");
    let subscription: { unsubscribe: () => void };

    async function setupAuth() {
      try {
        console.log("Setting up auth state listener...");
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
              console.log("User signed in, redirecting to dashboard...");
              const isDashboardRoute = location.pathname.startsWith('/dashboard');
              if (!isDashboardRoute) {
                navigate('/dashboard');
                toast.success("Welcome back! You have successfully signed in.");
              }
            }
            if (event === 'SIGNED_OUT') {
              console.log("User signed out, redirecting to home...");
              navigate('/');
              toast.success("You have been signed out successfully.");
            }
          }
        });

        subscription = authListener.data.subscription;
        console.log("Auth listener set up successfully");

        // Then check for existing session
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }
        
        console.log("Initial session check:", data.session ? `Session found for ${data.session.user.email}` : "No session");
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
      console.log("AuthProvider unmounting, cleaning up subscription");
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate, location.pathname]);

  // Update initialAuthCheckDone separately
  useEffect(() => {
    if (initialAuthCheckDone) {
      console.log("Initial auth check complete, current path:", location.pathname);
      // If user is authenticated and on login page, redirect to dashboard
      if (session && (location.pathname === '/login' || location.pathname === '/register')) {
        console.log("User is authenticated and on login/register page, redirecting to dashboard");
        navigate('/dashboard');
      }
    }
  }, [initialAuthCheckDone, session, location.pathname, navigate]);

  const signIn = async (email: string, password: string): Promise<void> => {
    console.log("Attempting sign in with:", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        uiToast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // We don't need to return data as the auth state will be updated via the onAuthStateChange event
      console.log("Sign in successful:", data.user ? `User: ${data.user.email}` : "No user returned");
      
      // Additional toast notification
      toast.success("Sign in successful!");
      
      // Not returning anything explicitly to match the Promise<void> return type
    } catch (error: any) {
      console.error("Sign in error (caught):", error);
      // Re-throw for the component to handle
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log("Attempting sign up with:", email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        uiToast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } else {
        console.log("Sign up successful:", data);
        toast.success("Welcome! Please check your email to verify your account.");
      }
    } catch (error: any) {
      console.error("Sign up error (caught):", error);
      // Re-throw for the component to handle
      throw error;
    }
  };

  const signOut = async () => {
    console.log("Attempting sign out");
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        uiToast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      console.log("Sign out successful");
    } catch (error: any) {
      console.error("Sign out error (caught):", error);
      // Re-throw for the component to handle
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
