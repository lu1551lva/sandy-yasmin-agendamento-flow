
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/admin/Sidebar";
import { useAuth } from "@/context/auth-context";

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium">Painel Administrativo</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
