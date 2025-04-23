
import { Outlet, useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/admin/Sidebar";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getSalonBySlug, isSalonActive } from "@/lib/supabase";
import { Loader } from "lucide-react";

const AdminLayout = () => {
  const { signOut, user, salon } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSalonAccess = async () => {
      // If we don't have a salon slug, ensure we have a logged-in user with valid salon
      if (!slug) {
        if (!user || !salon) {
          navigate("/admin/login");
          return;
        }
        
        // Redirect to the salon's admin dashboard
        if (salon.url_personalizado) {
          navigate(`/admin/${salon.url_personalizado}`);
        }
        return;
      }

      // If we have a slug, check if the user has access to this salon
      // This is to prevent users from accessing other salon's admin panels
      if (user && salon && salon.url_personalizado !== slug) {
        setError("Você não tem permissão para acessar este painel");
        setTimeout(() => {
          navigate(`/admin/${salon.url_personalizado}`);
        }, 3000);
        return;
      }

      // Check if the salon is active
      if (salon && !isSalonActive(salon)) {
        setError("Seu período de avaliação expirou. Por favor, ative seu plano para continuar.");
        return;
      }

      setLoading(false);
    };

    checkSalonAccess();
  }, [slug, user, salon, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-medium text-red-500 mb-4">Erro de Acesso</h1>
          <p className="mb-4">{error}</p>
          <div className="flex space-x-4">
            <Button onClick={() => navigate("/admin/login")}>
              Login
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Página Inicial
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar salonSlug={slug} />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium">Painel Administrativo {salon?.nome ? `- ${salon.nome}` : ''}</h1>
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

export default AdminLayout;
