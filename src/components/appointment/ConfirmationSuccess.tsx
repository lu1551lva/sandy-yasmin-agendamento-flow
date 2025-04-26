
import { Button } from "@/components/ui/button";
import { Check, Send } from "lucide-react";
import { createWhatsAppLink } from "@/lib/utils";
import { Service } from "@/lib/supabase";
import { formatLocalDate } from "@/lib/dateUtils";

interface ConfirmationSuccessProps {
  appointmentId: string | null;
  clientPhone?: string;
  whatsappMessage?: string;
  appointmentData?: {
    client?: {
      nome?: string;
      telefone?: string;
    };
    service?: Service;
    date?: string;
    time?: string;
    professional_name?: string;
  };
}

const ConfirmationSuccess = ({ 
  appointmentId, 
  clientPhone, 
  whatsappMessage,
  appointmentData 
}: ConfirmationSuccessProps) => {
  // Fallback values if not provided directly
  const phone = clientPhone || appointmentData?.client?.telefone || "";
  
  // Create a friendly message with emojis and formatting
  const defaultMessage = appointmentData ? 
    `Olá ${appointmentData.client?.nome}! 👋

Seu agendamento foi confirmado com sucesso!

✅ Profissional: ${appointmentData.professional_name}
✅ Serviço: ${appointmentData.service?.nome}
✅ Data e Hora: ${formatLocalDate(appointmentData.date || "")} às ${appointmentData.time}

Aguardamos você! ✨
Studio Sandy Yasmin 💇‍♀️` : 
    `Olá! Seu agendamento #${appointmentId} foi confirmado.`;

  const message = whatsappMessage || defaultMessage;

  return (
    <div className="text-center space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
        <Check className="h-8 w-8" />
      </div>
      <p className="text-lg">Seu agendamento foi confirmado com sucesso!</p>
      <p className="text-gray-500">
        Enviamos um e-mail com os detalhes do seu agendamento.
      </p>

      <div className="mt-6">
        <Button
          className="w-full sm:w-auto"
          onClick={() =>
            window.open(createWhatsAppLink(phone, message), "_blank")
          }
        >
          <Send className="mr-2 h-4 w-4" /> Enviar confirmação via WhatsApp
        </Button>
      </div>

      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => (window.location.href = "/agendar")}
        >
          Fazer novo agendamento
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationSuccess;
