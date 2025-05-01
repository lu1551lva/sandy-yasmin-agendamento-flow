
import { formatCurrency } from "@/lib/supabase";
import { Scissors, Clock, Banknote } from "lucide-react";

interface ServiceDetailsSectionProps {
  servico: {
    nome: string;
    valor: number;
    duracao_em_minutos: number;
  };
}

export function ServiceDetailsSection({ servico }: ServiceDetailsSectionProps) {
  return (
    <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
      <h3 className="text-lg font-medium flex items-center gap-2 text-purple-700">
        <Scissors className="h-5 w-5" />
        Serviço
      </h3>
      <div className="space-y-2 pl-1">
        <p className="font-medium">{servico.nome}</p>
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-muted-foreground" />
          <p className="text-green-600 font-medium">{formatCurrency(servico.valor)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-muted-foreground">{servico.duracao_em_minutos} minutos</p>
        </div>
      </div>
    </div>
  );
}
