
import { Service } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

interface AppointmentSummaryProps {
  service: Service;
  professionalName: string;
  date: Date;
  time: string;
  client: { nome: string; telefone: string; email: string };
}

const AppointmentSummary = ({
  service,
  professionalName,
  date,
  time,
  client,
}: AppointmentSummaryProps) => (
  <div>
    <h3 className="font-medium text-lg mb-4">Resumo do agendamento</h3>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Serviço:</span>
        <span className="font-medium">{service.nome}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Valor:</span>
        <span className="font-medium">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(service.valor)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Data:</span>
        <span className="font-medium">{formatDate(date)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Horário:</span>
        <span className="font-medium">{time}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Duração:</span>
        <span className="font-medium">{service.duracao_em_minutos} minutos</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Profissional:</span>
        <span className="font-medium">{professionalName || "Profissional padrão"}</span>
      </div>
    </div>
    <hr className="my-4" />
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Nome:</span>
        <span className="font-medium">{client.nome}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Telefone:</span>
        <span className="font-medium">{client.telefone}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">E-mail:</span>
        <span className="font-medium">{client.email}</span>
      </div>
    </div>
  </div>
);

export default AppointmentSummary;
