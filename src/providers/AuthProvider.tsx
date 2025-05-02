
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Track user-initiated auth actions
  const [userInitiatedAction, setUserInitiatedAction] = useState<boolean>(false);

  useEffect(() => {
    console.log("Setting up auth state listener");
    let isInitialAuthCheck = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log(`Auth state change event: ${event}, initial check: ${isInitialAuthCheck}, user initiated: ${userInitiatedAction}`);
        
        // Always update session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        // Only navigate if this is a user-initiated action (not a token refresh or focus event)
        if (!isInitialAuthCheck && userInitiatedAction) {
          if (event === 'SIGNED_IN') {
            console.log("Navigating to dashboard after user-initiated sign in");
            navigate('/dashboard');
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in.",
            });
            // Reset the flag after handling the event
            setUserInitiatedAction(false);
          }
          if (event === 'SIGNED_OUT') {
            console.log("Navigating to home after user-initiated sign out");
            navigate('/');
            toast({
              title: "Signed out",
              description: "You have been signed out successfully.",
            });
            // Reset the flag after handling the event
            setUserInitiatedAction(false);
          }
        }

        // After processing the first auth state change event, mark initial check as complete
        if (isInitialAuthCheck) {
          isInitialAuthCheck = false;
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check completed");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, userInitiatedAction]);

  const signIn = async (email: string, password: string) => {
    // Set flag to indicate this is a user-initiated action
    setUserInitiatedAction(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Reset flag if there's an error
      setUserInitiatedAction(false);
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Set flag to indicate this is a user-initiated action
    setUserInitiatedAction(true);
    
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
      // Reset flag if there's an error
      setUserInitiatedAction(false);
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
    // Set flag to indicate this is a user-initiated action
    setUserInitiatedAction(true);
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Reset flag if there's an error
      setUserInitiatedAction(false);
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
