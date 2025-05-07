
import { AppointmentWithDetails } from "@/types/appointment.types";
import { formatDate, formatDateTime } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface AppointmentDetailsProps {
  appointment: AppointmentWithDetails;
}

export function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <Badge className="bg-blue-500">Agendado</Badge>;
      case "concluido":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "cancelado":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Status</h3>
        {getStatusBadge(appointment.status)}
      </div>
      
      {/* Customer Details */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Cliente</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome:</span>
              <span className="font-medium">{appointment.cliente.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefone:</span>
              <span className="font-medium">{appointment.cliente.telefone}</span>
            </div>
            {appointment.cliente.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{appointment.cliente.email}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Service Details */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Serviço</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serviço:</span>
              <span className="font-medium">{appointment.servico.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profissional:</span>
              <span className="font-medium">{appointment.profissional.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-medium">{formatCurrency(appointment.servico.valor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duração:</span>
              <span className="font-medium">{appointment.servico.duracao_em_minutos} minutos</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Date and Time */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Data e Hora</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">{formatDate(appointment.data)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horário:</span>
              <span className="font-medium">{appointment.hora}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Notes section if applicable - only show if motivo_cancelamento exists */}
      {appointment.motivo_cancelamento && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Observações</h3>
            <p className="text-sm whitespace-pre-wrap">{appointment.motivo_cancelamento}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
