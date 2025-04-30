
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Clock } from "lucide-react";

interface AppointmentDetailsSectionProps {
  data: string;
  hora: string;
  profissional?: string;
}

export function AppointmentDetailsSection({ data, hora, profissional }: AppointmentDetailsSectionProps) {
  // Format date for Brazilian date format
  const formattedDate = data.includes('-') 
    ? format(parseISO(data), "dd/MM/yyyy", { locale: ptBR })
    : data;
    
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Agendamento</h3>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <p>Horário: {hora}</p>
      </div>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4" />
        <p>Data: {formattedDate}</p>
      </div>
      {profissional && (
        <div className="flex items-center gap-2">
          <p>Profissional: {profissional}</p>
        </div>
      )}
    </div>
  );
}
