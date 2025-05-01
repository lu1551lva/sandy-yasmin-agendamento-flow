
import { User, Phone, Mail } from "lucide-react";

interface CustomerDetailsSectionProps {
  cliente: {
    nome: string;
    telefone: string;
    email: string;
  };
}

export function CustomerDetailsSection({ cliente }: CustomerDetailsSectionProps) {
  return (
    <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
      <h3 className="text-lg font-medium flex items-center gap-2 text-blue-700">
        <User className="h-5 w-5" />
        Cliente
      </h3>
      <div className="space-y-2 pl-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{cliente.nome}</p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <a href={`tel:${cliente.telefone}`} className="hover:underline text-blue-600 transition-colors">
            {cliente.telefone}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a href={`mailto:${cliente.email}`} className="hover:underline text-blue-600 transition-colors">
            {cliente.email}
          </a>
        </div>
      </div>
    </div>
  );
}
