
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useWhatsAppTemplates } from "@/hooks/useWhatsAppTemplates";
import { AppointmentWithDetails } from "@/types/appointment.types";

interface WhatsAppTemplatePreviewProps {
  templateKey: string;
  appointment: AppointmentWithDetails | null;
}

export function WhatsAppTemplatePreview({
  templateKey,
  appointment
}: WhatsAppTemplatePreviewProps) {
  const { templates, formatMessage } = useWhatsAppTemplates();
  
  // Generate preview text
  const getPreviewText = () => {
    if (!appointment) {
      // Sample values for preview when no appointment is selected
      return formatMessage(templateKey, {
        nome: "Cliente",
        servico: "Corte de Cabelo",
        data: "01/06/2025",
        hora: "14:00",
        valor: "R$ 80,00",
        profissional: "Sandy"
      });
    }
    
    // Use real appointment data
    return formatMessage(templateKey, {
      nome: appointment.cliente.nome,
      servico: appointment.servico.nome,
      data: format(new Date(appointment.data), "dd/MM/yyyy"),
      hora: appointment.hora,
      valor: `R$ ${appointment.servico.valor.toFixed(2)}`,
      profissional: appointment.profissional.nome
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Pré-visualização</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-[#e5f7d3] p-3 rounded-lg text-sm text-[#303030] font-normal min-h-[120px] whitespace-pre-wrap">
          {getPreviewText()}
        </div>
      </CardContent>
    </Card>
  );
}
