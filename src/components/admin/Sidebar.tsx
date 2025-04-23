
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

interface SidebarProps {
  salonSlug?: string;
}

const Sidebar = ({ salonSlug }: SidebarProps) => {
  const { signOut, isSuperAdmin } = useAuth();
  
  const baseUrl = salonSlug ? `/admin/${salonSlug}` : '/admin';

  const navItems = [
    {
      name: "Dashboard",
      path: baseUrl,
      icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
    },
    {
      name: "Agendamentos",
      path: `${baseUrl}/agendamentos`,
      icon: <ClipboardList className="mr-2 h-5 w-5" />,
    },
    {
      name: "Agenda Semanal",
      path: `${baseUrl}/agenda-semanal`,
      icon: <Calendar className="mr-2 h-5 w-5" />,
    },
    {
      name: "Profissionais",
      path: `${baseUrl}/profissionais`,
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      name: "Serviços",
      path: `${baseUrl}/servicos`,
      icon: <Scissors className="mr-2 h-5 w-5" />,
    },
    {
      name: "Mensagens WhatsApp",
      path: `${baseUrl}/mensagens`,
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
                end={item.path === baseUrl}
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
          
          {/* Show link to public booking page */}
          {salonSlug && (
            <li className="mt-4">
              <NavLink
                to={`/agendar/${salonSlug}`}
                className="flex items-center px-4 py-3 text-sm rounded-md text-gray-300 hover:text-white hover:bg-white/10"
                target="_blank"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Página de Agendamento
              </NavLink>
            </li>
          )}
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
