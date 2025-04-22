
import { Outlet } from "react-router-dom";
import { Logo } from "@/components/common/Logo";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-white py-4 shadow-sm">
        <div className="salon-container flex justify-center">
          <Logo />
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
