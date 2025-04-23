
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useAdminAuth();
  const location = useLocation();

  // Check if the admin is logged in
  if (isLoggedIn) {
    return <>{children}</>;
  }

  // If not logged in, redirect to the login page with the current location
  return <Navigate to="/admin/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
