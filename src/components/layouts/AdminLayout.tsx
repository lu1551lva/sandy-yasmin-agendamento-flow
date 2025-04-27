
import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../admin/AdminSidebar";
import AdminHeader from "../admin/AdminHeader";
import { useAuth } from "@/context/auth-context";
import Breadcrumbs from "../admin/Breadcrumbs";

const AdminLayout = () => {
  const { isLoggedIn, signOut } = useAuth();
  
  // Proteger o layout administrativo
  if (!isLoggedIn) {
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
