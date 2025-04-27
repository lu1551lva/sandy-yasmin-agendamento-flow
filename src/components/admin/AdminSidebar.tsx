
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  CalendarDays, 
  Users, 
  Settings, 
  MessageSquare,
  Menu,
  X,
  User
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminSidebar = () => {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      title: "Agendamentos",
      href: "/admin/agendamentos",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      title: "Agenda Semanal",
      href: "/admin/agenda-semanal",
      icon: <CalendarDays className="mr-2 h-4 w-4" />,
    },
    {
      title: "Profissionais",
      href: "/admin/profissionais",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Serviços",
      href: "/admin/servicos",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      title: "WhatsApp",
      href: "/admin/mensagens",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
    {
      title: "Meu Perfil",
      href: "/admin/perfil",
      icon: <User className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-3 left-3 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b">
            <h2 className="text-lg font-semibold font-playfair">Sandy Yasmin</h2>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {link.icon}
                  {link.title}
                </Link>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
