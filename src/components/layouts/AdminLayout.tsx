
import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../admin/AdminSidebar";
import AdminHeader from "../admin/AdminHeader";
import { useAuth } from "@/context/auth-context";
import Breadcrumbs from "../admin/Breadcrumbs";
import { Loader2 } from "lucide-react";

const AdminLayout = () => {
  const { isLoggedIn, signOut, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Protect admin layout
  if (!isLoggedIn) {
    console.log("Access denied: User not logged in. Redirecting to login from AdminLayout");
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader onLogout={signOut} />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
