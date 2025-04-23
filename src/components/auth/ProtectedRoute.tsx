
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useAdminAuth();

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
