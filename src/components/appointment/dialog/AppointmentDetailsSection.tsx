
import { Calendar, Clock, User } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentDetailsSectionProps {
  data: string;
  hora: string;
  profissional: string;
}

export function AppointmentDetailsSection({ data, hora, profissional }: AppointmentDetailsSectionProps) {
  const date = parseISO(data);
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  return (
    <div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-100">
      <h3 className="text-lg font-medium flex items-center gap-2 text-green-700">
        <Calendar className="h-5 w-5" />
        Detalhes do Agendamento
      </h3>
      <div className="space-y-2 pl-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <p className="flex items-center gap-1">
            {isToday(date) && <span className="text-green-600 font-medium">Hoje</span>}
            {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p>{hora}</p>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <p>{profissional}</p>
        </div>
      </div>
    </div>
  );
}
