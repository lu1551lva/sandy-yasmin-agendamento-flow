
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

const SuperAdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();

  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  // Only authenticated users past this point
  return <>{children}</>;
};

export default SuperAdminLayout;
