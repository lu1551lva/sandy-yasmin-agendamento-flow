
import { Button } from "@/components/ui/button";
import { Client } from "@/lib/supabase";

interface ClientProfileProps {
  client: Client;
  onLogout: () => void;
}

export const ClientProfile = ({ client, onLogout }: ClientProfileProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Nome</label>
        <p>{client.nome}</p>
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <p>{client.email}</p>
      </div>
      <div>
        <label className="text-sm font-medium">Telefone</label>
        <p>{client.telefone}</p>
      </div>
      
      <div className="md:col-span-2 pt-4">
        <Button 
          variant="outline" 
          onClick={onLogout}
        >
          Sair
        </Button>
      </div>
    </div>
  );
};
