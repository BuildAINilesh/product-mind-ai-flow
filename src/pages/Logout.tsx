
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const Logout = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut();
        // Note: we don't need to redirect here, as the AuthProvider will
        // handle the redirection on SIGNED_OUT event
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    performLogout();
  }, [signOut]);

  // Return null instead of immediately redirecting
  // Let the auth state change handle the navigation
  return null;
};

export default Logout;
