
import { Outlet } from "react-router-dom";
import AdminSidebar from "../admin/AdminSidebar";
import AdminHeader from "../admin/AdminHeader";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminLayout = () => {
  const { logout } = useAdminAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader onLogout={logout} />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
