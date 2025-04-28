
import { useState } from "react";
import { AppointmentDialog } from "./AppointmentDialog";
import { Button } from "@/components/ui/button";
import { format, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarClock, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  PhoneCall 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { formatCurrency } from "@/lib/supabase";

interface AppointmentListProps {
  appointments: AppointmentWithDetails[];
  onAppointmentUpdated?: () => void;
}

export function AppointmentList({ appointments, onAppointmentUpdated }: AppointmentListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>;
      case "concluido":
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case "cancelado":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div 
            key={appointment.id}
            className={`p-4 border rounded-lg shadow-sm transition-colors ${
              appointment.status === "concluido"
                ? "bg-green-50 border-green-200"
                : appointment.status === "cancelado"
                ? "bg-red-50 border-red-200"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{appointment.cliente.nome}</h3>
                  {getStatusBadge(appointment.status)}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  <PhoneCall className="h-3.5 w-3.5 inline mr-1" />
                  {appointment.cliente.telefone}
                </p>
                
                <div className="mt-2">
                  <p className="font-medium">{appointment.servico.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(appointment.servico.valor)} • {appointment.servico.duracao_em_minutos} minutos
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 text-right">
                <div className="space-y-1">
                  <p className="text-sm">
                    {isToday(parseISO(appointment.data)) ? "Hoje" : format(parseISO(appointment.data), "dd/MM/yyyy")}
                  </p>
                  <p className="text-lg font-bold">{appointment.hora}</p>
                  <p className="text-xs text-muted-foreground">Com {appointment.profissional.nome}</p>
                </div>
                
                <div className="mt-3 flex justify-end gap-2">
                  {appointment.status === "agendado" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-600"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Concluir
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-600"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <CalendarClock className="h-4 w-4 mr-1" /> Reagendar
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Cancelar
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    Detalhes <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedAppointment && (
        <AppointmentDialog
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onAppointmentUpdated={onAppointmentUpdated}
        />
      )}
    </>
  );
}
