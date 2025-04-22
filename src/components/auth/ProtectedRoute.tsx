
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useAdminAuth();
  const location = useLocation();

  if (isLoggedIn) {
    return <>{children}</>;
  }

  return <Navigate to="/admin/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
