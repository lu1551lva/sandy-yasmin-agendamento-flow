
import { AppointmentWithDetails } from "@/types/appointment.types";
import { formatCurrency } from "@/lib/utils";
import { User, Scissors, Clock } from "lucide-react";

interface DialogBodyProps {
  appointment: AppointmentWithDetails;
}

export function DialogBody({ appointment }: DialogBodyProps) {
  return (
    <div className="py-4 space-y-4">
      {/* Cliente */}
      <div className="flex items-start gap-3">
        <div className="bg-muted p-2 rounded-full">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Cliente</p>
          <p className="text-sm">{appointment.cliente.nome}</p>
          <p className="text-xs text-muted-foreground">{appointment.cliente.telefone}</p>
        </div>
      </div>

      {/* Profissional */}
      <div className="flex items-start gap-3">
        <div className="bg-muted p-2 rounded-full">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Profissional</p>
          <p className="text-sm">{appointment.profissional.nome}</p>
        </div>
      </div>

      {/* Serviço */}
      <div className="flex items-start gap-3">
        <div className="bg-muted p-2 rounded-full">
          <Scissors className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Serviço</p>
          <p className="text-sm">{appointment.servico.nome}</p>
          <div className="flex gap-4 mt-1">
            <p className="text-xs text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              {appointment.servico.duracao_em_minutos} minutos
            </p>
            <p className="text-xs font-medium">
              {formatCurrency(appointment.servico.valor)}
            </p>
          </div>
        </div>
      </div>

      {/* Observações */}
      {appointment.observacao && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium">Observações</p>
          <p className="text-sm text-muted-foreground mt-1">{appointment.observacao}</p>
        </div>
      )}
    </div>
  );
}
