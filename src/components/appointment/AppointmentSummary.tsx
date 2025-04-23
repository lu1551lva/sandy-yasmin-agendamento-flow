
import { formatCurrency } from "@/lib/supabase";
import { Service, Client } from "@/lib/supabase";
import { formatLocalDate } from "@/lib/dateUtils";

interface AppointmentSummaryProps {
  service?: Service;
  professionalName?: string;
  date?: string;
  time?: string;
  client?: Client;
  appointmentData?: {
    service?: Service;
    professional_name?: string;
    date?: string;
    time?: string;
    client?: Client;
  };
}

const AppointmentSummary = ({
  service,
  professionalName,
  date,
  time,
  client,
  appointmentData,
}: AppointmentSummaryProps) => {
  // Allow direct props or data from appointmentData
  const _service = service || appointmentData?.service;
  const _professionalName = professionalName || appointmentData?.professional_name;
  const _date = date || appointmentData?.date;
  const _time = time || appointmentData?.time;
  const _client = client || appointmentData?.client;

  if (!_service || !_date || !_time || !_client) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Dados do agendamento incompletos
      </div>
    );
  }

  const formatDateDisplay = (dateString: string) => {
    try {
      return formatLocalDate(dateString);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
      <div>
        <h3 className="font-medium text-lg">Serviço</h3>
        <p>{_service.nome}</p>
        <p className="text-sm text-muted-foreground">
          Valor: {formatCurrency(_service.valor)} • 
          Duração: {_service.duracao_em_minutos} min
        </p>
      </div>

      {_professionalName && (
        <div>
          <h3 className="font-medium">Profissional</h3>
          <p>{_professionalName}</p>
        </div>
      )}

      <div>
        <h3 className="font-medium">Data e Hora</h3>
        <p>
          {formatDateDisplay(_date)} às {_time}
        </p>
      </div>

      <div>
        <h3 className="font-medium">Cliente</h3>
        <p>{_client.nome}</p>
        <p className="text-sm text-muted-foreground">
          {_client.telefone} • {_client.email}
        </p>
      </div>
    </div>
  );
};

export default AppointmentSummary;
