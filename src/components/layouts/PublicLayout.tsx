
import { Outlet, Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-white py-4 shadow-sm">
        <div className="salon-container flex justify-between items-center">
          <Logo />
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="flex items-center gap-2"
          >
            <Link to="/admin/login">
              <LogIn className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>
      </header>
      <main className="salon-container py-8">
        <Outlet />
      </main>
      <footer className="bg-dark text-white py-6 mt-auto">
        <div className="salon-container text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Studio Sandy Yasmin | Todos os direitos reservados
          </p>
          <p className="text-xs mt-2 text-gray-400">
            Agendamento online de serviços de beleza
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
