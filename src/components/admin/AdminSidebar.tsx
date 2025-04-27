
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
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const AdminSidebar = () => {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false);

  const links = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Agendamentos",
      href: "/admin/agendamentos",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: "Agenda Semanal",
      href: "/admin/agenda-semanal",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      title: "Profissionais",
      href: "/admin/profissionais",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Serviços",
      href: "/admin/servicos",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: "WhatsApp",
      href: "/admin/mensagens",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      title: "Meu Perfil",
      href: "/admin/perfil",
      icon: <User className="h-4 w-4" />,
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
          "fixed inset-y-0 left-0 z-40 transform bg-background border-r transition-all duration-300 ease-in-out md:translate-x-0 md:static md:h-screen",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn("h-16 flex items-center px-6 border-b justify-between", 
            collapsed && "px-3 justify-center")
          }>
            {!collapsed && <h2 className="text-lg font-semibold font-playfair">Sandy Yasmin</h2>}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCollapsed(!collapsed)}
              className={cn("md:flex hidden", collapsed ? "rotate-180" : "")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              <TooltipProvider delayDuration={0}>
                {links.map((link) => (
                  <Tooltip key={link.href}>
                    <TooltipTrigger asChild>
                      <Link
                        to={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                          pathname === link.href
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted",
                          collapsed ? "justify-center px-2" : ""
                        )}
                      >
                        {link.icon}
                        {!collapsed && <span className="ml-2">{link.title}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        {link.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </TooltipProvider>
            </nav>
          </ScrollArea>
          
          <div className="p-2 border-t flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="md:hidden"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
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
