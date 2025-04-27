
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items: propItems }: BreadcrumbsProps) => {
  const location = useLocation();
  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  
  useEffect(() => {
    if (propItems) {
      setItems(propItems);
      return;
    }

    // Gerar itens de breadcrumb automaticamente com base na rota
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      setItems([
        { label: "Dashboard", href: "/admin", icon: <Home className="h-4 w-4" /> }
      ]);
      return;
    }
    
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: "Dashboard", href: "/admin", icon: <Home className="h-4 w-4" /> }
    ];
    
    let currentPath = "";
    
    pathSegments.forEach((segment, index) => {
      if (segment === "admin") return;
      
      currentPath += `/${segment}`;
      
      // Transformar "agendamentos" em "Agendamentos"
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      
      breadcrumbItems.push({
        label,
        href: index === pathSegments.length - 1 ? "#" : `/admin${currentPath}`,
      });
    });
    
    setItems(breadcrumbItems);
  }, [location.pathname, propItems]);

  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            )}
            
            {index === items.length - 1 ? (
              <span className="font-medium text-foreground flex items-center">
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-primary flex items-center transition-colors"
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
