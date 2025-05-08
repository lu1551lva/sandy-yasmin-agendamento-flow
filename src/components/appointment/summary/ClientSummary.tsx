
import { Client } from "@/lib/supabase";
import { maskPhone, maskEmail } from "@/lib/securityUtils";

interface ClientSummaryProps {
  client: Client;
  showFullDetails?: boolean;
}

const ClientSummary = ({ client, showFullDetails = false }: ClientSummaryProps) => {
  // Use full data or masked data based on showFullDetails flag
  const displayPhone = showFullDetails ? client.telefone : maskPhone(client.telefone);
  const displayEmail = showFullDetails ? client.email : maskEmail(client.email);

  return (
    <div>
      <h3 className="font-medium">Cliente</h3>
      <p>{client.nome}</p>
      <p className="text-sm text-muted-foreground">
        {displayPhone} • {displayEmail}
      </p>
    </div>
  );
};

export default ClientSummary;
