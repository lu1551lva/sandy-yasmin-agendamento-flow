
import { Service } from "@/lib/supabase";
import { formatCurrency } from "@/lib/currencyUtils";

interface ServiceSummaryProps {
  service: Service;
}

const ServiceSummary = ({ service }: ServiceSummaryProps) => {
  return (
    <div>
      <h3 className="font-medium text-lg">Serviço</h3>
      <p>{service.nome}</p>
      <p className="text-sm text-muted-foreground">
        Valor: {formatCurrency(service.valor)} • 
        Duração: {service.duracao_em_minutos} min
      </p>
    </div>
  );
};

export default ServiceSummary;
