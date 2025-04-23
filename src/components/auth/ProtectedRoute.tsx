
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Loader } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, salon, isSuperAdmin } = useAuth();
  const location = useLocation();
  const { slug } = useParams<{ slug?: string }>();
  
  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // Handle super admin routes
  const isSuperAdminRoute = location.pathname.startsWith('/superadmin');
  if (isSuperAdminRoute) {
    // Only allow access to superadmin if the user is the super admin
    if (!isSuperAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  }
  
  // For regular salon admin routes
  // If using a slug, validate that the user has access to this salon
  if (slug && salon && salon.url_personalizado !== slug) {
    return <Navigate to={`/admin/${salon.url_personalizado}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
