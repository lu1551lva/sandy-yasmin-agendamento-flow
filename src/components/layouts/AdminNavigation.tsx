
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  UserCircle, 
  Users, 
  PackageSearch, 
  User
} from "lucide-react";

export function AdminNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath.startsWith(path);
  };

  const navItems = [
    {
      name: "Agendamentos",
      icon: <Calendar className="h-5 w-5" />,
      path: "/admin/agendamentos",
      isActive: isActive("/admin/agendamentos") || currentPath === "/admin",
    },
    {
      name: "Clientes",
      icon: <Users className="h-5 w-5" />,
      path: "/admin/clientes",
      isActive: isActive("/admin/clientes"),
    },
    {
      name: "Profissionais",
      icon: <UserCircle className="h-5 w-5" />,
      path: "/admin/profissionais",
      isActive: isActive("/admin/profissionais"),
    },
    {
      name: "Serviços",
      icon: <PackageSearch className="h-5 w-5" />,
      path: "/admin/servicos",
      isActive: isActive("/admin/servicos"),
    },
    {
      name: "Perfil",
      icon: <User className="h-5 w-5" />,
      path: "/admin/perfil",
      isActive: isActive("/admin/perfil"),
    },
  ];

  return (
    <div className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`flex items-center px-3 py-2 text-sm rounded-md group transition-colors ${
            item.isActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <div className={`mr-2 ${item.isActive ? "text-foreground" : ""}`}>
            {item.icon}
          </div>
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
}
