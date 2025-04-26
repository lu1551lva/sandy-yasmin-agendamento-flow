
import { Client } from "@/lib/supabase";

interface ClientSummaryProps {
  client: Client;
}

const ClientSummary = ({ client }: ClientSummaryProps) => {
  return (
    <div>
      <h3 className="font-medium">Cliente</h3>
      <p>{client.nome}</p>
      <p className="text-sm text-muted-foreground">
        {client.telefone} • {client.email}
      </p>
    </div>
  );
};

export default ClientSummary;
