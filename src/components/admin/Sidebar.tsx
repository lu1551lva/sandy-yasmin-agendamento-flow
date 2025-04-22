
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { 
  Calendar, 
  ClipboardList, 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Scissors,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";

const Sidebar = () => {
  const { signOut } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
    },
    {
      name: "Agendamentos",
      path: "/admin/agendamentos",
      icon: <ClipboardList className="mr-2 h-5 w-5" />,
    },
    {
      name: "Agenda Semanal",
      path: "/admin/agenda-semanal",
      icon: <Calendar className="mr-2 h-5 w-5" />,
    },
    {
      name: "Profissionais",
      path: "/admin/profissionais",
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      name: "Serviços",
      path: "/admin/servicos",
      icon: <Scissors className="mr-2 h-5 w-5" />,
    },
    {
      name: "Mensagens WhatsApp",
      path: "/admin/mensagens",
      icon: <MessageSquare className="mr-2 h-5 w-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-dark text-white min-h-screen flex flex-col">
      <div className="p-4 mb-6 mt-4">
        <Logo />
      </div>
      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-gold text-white font-medium"
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
  );
};

export default Sidebar;
