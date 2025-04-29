
import { User, Phone, Mail } from "lucide-react";

interface ClientDetailsSectionProps {
  cliente: {
    nome: string;
    telefone: string;
    email: string;
  };
}

export function ClientDetailsSection({ cliente }: ClientDetailsSectionProps) {
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
          {cliente.telefone}
        </a>
      </div>
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        <a href={`mailto:${cliente.email}`} className="hover:underline">
          {cliente.email}
        </a>
      </div>
    </div>
  );
}
