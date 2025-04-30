
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Scissors,
  MessageSquare,
  User,
  Calendar,
  Ban,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavigationProps {
  isMobile?: boolean;
  closeMobileMenu?: () => void;
}

const AdminNavigation = ({ isMobile = false, closeMobileMenu }: AdminNavigationProps) => {
  // Function to handle item click on mobile
  const handleItemClick = () => {
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };

  const linkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "hover:bg-muted text-muted-foreground"
    );

  const navLinks = [
    {
      to: "/admin",
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
    },
    {
      to: "/admin/agendamentos",
      icon: <CalendarCheck size={18} />,
      label: "Agendamentos",
    },
    {
      to: "/admin/agenda-semanal",
      icon: <Calendar size={18} />,
      label: "Agenda Semanal",
    },
    {
      to: "/admin/profissionais",
      icon: <Users size={18} />,
      label: "Profissionais",
    },
    {
      to: "/admin/servicos",
      icon: <Scissors size={18} />,
      label: "Serviços",
    },
    {
      to: "/admin/mensagens",
      icon: <MessageSquare size={18} />,
      label: "Mensagens",
    },
    {
      to: "/admin/perfil",
      icon: <User size={18} />,
      label: "Perfil",
    },
    {
      to: "/admin/bloqueios",
      icon: <Ban size={18} />,
      label: "Bloqueios",
    },
    {
      to: "/admin/avaliacoes",
      icon: <Star size={18} />,
      label: "Avaliações",
    },
  ];

  return (
    <nav className="space-y-1 py-2">
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => linkClass(isActive)}
          onClick={handleItemClick}
          end={link.to === "/admin"}
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default AdminNavigation;
