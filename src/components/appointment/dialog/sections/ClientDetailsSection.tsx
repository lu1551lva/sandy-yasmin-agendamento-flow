
import { User, Phone, Mail } from "lucide-react";
import { maskPhone, maskEmail } from "@/lib/securityUtils";

interface ClientDetailsSectionProps {
  cliente: {
    nome: string;
    telefone: string;
    email: string;
  };
  showFullDetails?: boolean;
}

export function ClientDetailsSection({ cliente, showFullDetails = false }: ClientDetailsSectionProps) {
  // Use full data or masked data based on showFullDetails flag
  const displayPhone = showFullDetails ? cliente.telefone : maskPhone(cliente.telefone);
  const displayEmail = showFullDetails ? cliente.email : maskEmail(cliente.email);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Cliente</h3>
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <p>{cliente.nome}</p>
      </div>
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        <a href={`tel:${cliente.telefone}`} className="hover:underline">
          {displayPhone}
        </a>
      </div>
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        <a href={`mailto:${cliente.email}`} className="hover:underline">
          {displayEmail}
        </a>
      </div>
    </div>
  );
}
