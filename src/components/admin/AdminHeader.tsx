
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 h-16 border-b bg-background flex items-center px-4 md:px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">Studio Sandy Yasmin</h1>
        <p className="text-sm text-muted-foreground">Painel Administrativo</p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
