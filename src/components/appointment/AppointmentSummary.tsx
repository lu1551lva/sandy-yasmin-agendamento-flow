
import { Service, Client } from "@/lib/supabase";
import ServiceSummary from "./summary/ServiceSummary";
import ProfessionalSummary from "./summary/ProfessionalSummary";
import DateTimeSummary from "./summary/DateTimeSummary";
import ClientSummary from "./summary/ClientSummary";

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

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
      <ServiceSummary service={_service} />
      <ProfessionalSummary professionalName={_professionalName || ''} />
      <DateTimeSummary date={_date} time={_time} />
      <ClientSummary client={_client} />
    </div>
  );
};

export default AppointmentSummary;
