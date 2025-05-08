
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  CalendarDays, 
  Scissors, 
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface NavItemProps {
  name: string;
  href: string;
  icon: React.ReactNode;
  end?: boolean;
}

const NavItem = ({ name, href, icon, end = false }: NavItemProps) => {
  const location = useLocation();
  const isActive = end
    ? location.pathname === href
    : location.pathname.startsWith(href);

  return (
    <Link
      to={href}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "w-full justify-start mb-1",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {icon}
      <span className="ml-2">{name}</span>
    </Link>
  );
};

export function SideNavigation() {
  return (
    <nav className="space-y-1 py-2">
      <NavItem
        name="Agendamentos"
        href="/admin"
        icon={<Calendar className="h-5 w-5" />}
        end
      />
      <NavItem
        name="Agenda Semanal"
        href="/admin/agenda-semanal"
        icon={<CalendarDays className="h-5 w-5" />}
      />
      <NavItem
        name="Profissionais"
        href="/admin/profissionais"
        icon={<Users className="h-5 w-5" />}
      />
      <NavItem
        name="Serviços"
        href="/admin/servicos"
        icon={<Scissors className="h-5 w-5" />}
      />
    </nav>
  );
}
