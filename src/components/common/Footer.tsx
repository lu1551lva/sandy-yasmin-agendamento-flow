
import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark py-8 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Logo />
            <p className="mt-2 text-sm text-gray-400">
              Beleza e bem-estar para você
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://instagram.com/studiosandyyasmin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
              >
                Instagram
              </a>
              <a 
                href="https://wa.me/5511940015784" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
              >
                WhatsApp
              </a>
            </div>
            
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Studio Sandy Yasmin. Todos os direitos reservados.
            </p>
            
            <Link 
              to="/admin/login" 
              className="text-xs text-primary hover:text-primary/80 mt-2 transition-colors font-medium"
            >
              Área Administrativa
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

