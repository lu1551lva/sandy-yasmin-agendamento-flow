
import { formatCurrency } from "@/lib/supabase";

interface ServiceDetailsSectionProps {
  servico: {
    nome: string;
    valor: number;
    duracao_em_minutos: number;
  };
}

export function ServiceDetailsSection({ servico }: ServiceDetailsSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Serviço</h3>
      <p>{servico.nome}</p>
      <p className="text-sm text-muted-foreground">
        Valor: {formatCurrency(servico.valor)}
      </p>
      <p className="text-sm text-muted-foreground">
        Duração: {servico.duracao_em_minutos} minutos
      </p>
    </div>
  );
}
