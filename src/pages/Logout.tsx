
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const Logout = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    performLogout();
  }, [signOut]);

  // Immediately redirect to home page
  return <Navigate to="/" replace />;
};

export default Logout;
