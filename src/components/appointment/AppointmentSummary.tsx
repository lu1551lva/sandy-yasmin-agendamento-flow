
import { Service } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

interface AppointmentSummaryProps {
  service?: Service;
  professionalName?: string;
  date?: Date;
  time?: string;
  client?: { nome: string; telefone: string; email: string };
  appointmentData?: {
    service?: Service;
    professional_name?: string;
    date?: Date;
    time?: string;
    client?: { nome: string; telefone: string; email: string };
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
  // Use direct props if available, otherwise fall back to appointmentData
  const serviceData = service || appointmentData?.service;
  const profName = professionalName || appointmentData?.professional_name || "Profissional padrão";
  const dateValue = date || appointmentData?.date;
  const timeValue = time || appointmentData?.time;
  const clientData = client || appointmentData?.client;

  if (!serviceData || !dateValue || !timeValue || !clientData) {
    return <div>Dados do agendamento incompletos</div>;
  }

  return (
    <div>
      <h3 className="font-medium text-lg mb-4">Resumo do agendamento</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Serviço:</span>
          <span className="font-medium">{serviceData.nome}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Valor:</span>
          <span className="font-medium">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(serviceData.valor)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Data:</span>
          <span className="font-medium">{formatDate(dateValue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Horário:</span>
          <span className="font-medium">{timeValue}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Duração:</span>
          <span className="font-medium">{serviceData.duracao_em_minutos} minutos</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Profissional:</span>
          <span className="font-medium">{profName}</span>
        </div>
      </div>
      <hr className="my-4" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Nome:</span>
          <span className="font-medium">{clientData.nome}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Telefone:</span>
          <span className="font-medium">{clientData.telefone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">E-mail:</span>
          <span className="font-medium">{clientData.email}</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSummary;
