
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Users, Settings, BarChart2 } from "lucide-react";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/Logo";

const SuperAdminLayout = () => {
  const { signOut, user, salon, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if not the super admin
  useEffect(() => {
    if (user && (!isSuperAdmin || salon?.email !== 'admin@meusistema.com')) {
      navigate("/admin/login");
    }
  }, [user, salon, isSuperAdmin, navigate]);

  const navItems = [
    {
      name: "Dashboard",
      path: "/superadmin",
      icon: <Home className="mr-2 h-5 w-5" />,
    },
    {
      name: "Salões",
      path: "/superadmin/saloes",
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      name: "Estatísticas",
      path: "/superadmin/estatisticas",
      icon: <BarChart2 className="mr-2 h-5 w-5" />,
    },
    {
      name: "Configurações",
      path: "/superadmin/configuracoes",
      icon: <Settings className="mr-2 h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-dark text-white min-h-screen flex flex-col">
        <div className="p-4 mb-6 mt-4 flex items-center space-x-2">
          <Logo />
          <span className="font-semibold text-xs bg-red-500 px-2 py-1 rounded">ADMIN</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/superadmin"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-red-600 text-white font-medium"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    )
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 mt-auto border-t border-gray-700">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium">Painel Super Administrador</h1>
            <div className="flex items-center space-x-2">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
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

export default SuperAdminLayout;
