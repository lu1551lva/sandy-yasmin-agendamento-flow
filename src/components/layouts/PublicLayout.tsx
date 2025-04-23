
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "@/components/common/Footer";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-context";

const PublicLayout = () => {
  const { user, salon } = useAuth();
  const location = useLocation();

  // Don't show admin link on the appointment pages
  const isAppointmentPage = location.pathname.startsWith('/agendar/');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b py-4 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">
            BeautySaaS
          </Link>
          <div className="flex items-center space-x-3">
            {user && salon ? (
              <Button asChild>
                <Link to={`/admin/${salon.url_personalizado}`}>
                  Meu Painel
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/admin/login" className="flex items-center">
                    Entrar
                  </Link>
                </Button>
                
                {!isAppointmentPage && (
                  <Button asChild>
                    <Link to="/registrar" className="flex items-center">
                      Criar Conta
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
