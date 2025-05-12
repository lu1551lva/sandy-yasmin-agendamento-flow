
import { AppointmentWithDetails } from "@/types/appointment.types";
import { DialogHeader as ShadcnDialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock } from "lucide-react";

interface DialogHeaderProps {
  appointment: AppointmentWithDetails;
}

export function DialogHeader({ appointment }: DialogHeaderProps) {
  // Parse the date string safely
  const appointmentDate = (() => {
    try {
      return parseISO(appointment.data);
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  })();

  const formattedDate = format(appointmentDate, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const getStatusBadge = () => {
    switch (appointment.status) {
      case "agendado":
        return <Badge className="bg-blue-500">Agendado</Badge>;
      case "concluido":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "cancelado":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <ShadcnDialogHeader className="space-y-2">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-xl flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Detalhes do Agendamento
        </DialogTitle>
        {getStatusBadge()}
      </div>
      <div className="text-sm text-muted-foreground">
        <p>
          {formattedDate} às {appointment.hora}
        </p>
      </div>
    </ShadcnDialogHeader>
  );
}
