
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { clearSensitiveData } from "@/lib/securityUtils";
import { User, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function AdminHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [admin, setAdmin] = useState<{ email: string; nome?: string } | null>(null);

  useEffect(() => {
    const getAdminDetails = async () => {
      try {
        // For the mock admin system - would use supabase auth in a real app
        const { data } = await supabase.from("admins").select("*").single();
        if (data) {
          setAdmin({
            email: data.email,
            nome: data.nome || "Admin"
          });
        }
      } catch (error) {
        console.error("Error fetching admin details:", error);
      }
    };

    getAdminDetails();
  }, []);

  const handleLogout = () => {
    // Clear any sensitive client data
    clearSensitiveData();
    
    // Log out the admin
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
    
    navigate("/admin/login");
  };

  return (
    <header className="border-b flex items-center justify-between px-6 py-3">
      <h1 className="text-lg font-medium">
        Painel Administrativo
      </h1>
      
      <div className="flex items-center gap-4">
        {admin && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {admin.nome || admin.email}
            </span>
          </div>
        )}
        
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </Button>
      </div>
    </header>
  );
}
