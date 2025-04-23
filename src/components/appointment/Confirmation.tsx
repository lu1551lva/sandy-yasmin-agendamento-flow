
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppointmentSummary from "./AppointmentSummary";
import ConfirmationActions from "./ConfirmationActions";
import ConfirmationSuccess from "./ConfirmationSuccess";
import { formatDate } from "@/lib/dateUtils";  // Ensure correct import

export interface ConfirmationProps {
  appointmentData: any;
  isSubmitting: boolean;
  isComplete: boolean;
  setIsSubmitting: (value: boolean) => void;
  setIsComplete: (value: boolean) => void;
  prevStep: () => void;
  salonId?: string;
}

const Confirmation = ({
  appointmentData,
  isSubmitting,
  isComplete,
  setIsSubmitting,
  setIsComplete,
  prevStep,
  salonId,
}: ConfirmationProps) => {
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!appointmentData.service || !appointmentData.date || !appointmentData.time || !appointmentData.client) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os dados do agendamento.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First check if we need to create a new client or use an existing one
      let clientId = appointmentData.client.id;
      
      if (!clientId) {
        // Insert new client
        const clientData = {
          nome: appointmentData.client.nome,
          telefone: appointmentData.client.telefone,
          email: appointmentData.client.email,
        };
        
        // If salonId provided, add it to the client data
        if (salonId) {
          (clientData as any).salao_id = salonId;
        }
        
        const { data: newClient, error: clientError } = await supabase
          .from("clientes")
          .insert(clientData)
          .select()
          .single();

        if (clientError) {
          throw clientError;
        }

        clientId = newClient.id;
      }

      // Modify the date formatting to use a single argument
      const formattedDate = formatDate(appointmentData.date);

      // Create appointment data
      const appointmentRecord = {
        cliente_id: clientId,
        servico_id: appointmentData.service.id,
        profissional_id: appointmentData.professional_id,
        data: formattedDate,
        hora: appointmentData.time,
        status: "agendado",
      };
      
      // If salonId provided, add it to the appointment data
      if (salonId) {
        (appointmentRecord as any).salao_id = salonId;
      }

      // Insert appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from("agendamentos")
        .insert(appointmentRecord)
        .select()
        .single();

      if (appointmentError) {
        throw appointmentError;
      }

      setAppointmentId(appointment.id);
      setIsComplete(true);
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro ao confirmar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {isComplete ? (
        <ConfirmationSuccess
          appointmentId={appointmentId}
          clientPhone={appointmentData.client?.telefone}
          whatsappMessage={`Olá! Seu agendamento para ${appointmentData.service?.nome} foi confirmado para ${formatDate(appointmentData.date)} às ${appointmentData.time}.`}
          appointmentData={appointmentData}
        />
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-playfair mb-2">
            Confirme seu agendamento
          </h2>
          <p className="text-gray-500">
            Por favor verifique os detalhes abaixo antes de confirmar.
          </p>

          <AppointmentSummary 
            service={appointmentData.service}
            professionalName={appointmentData.professional_name}
            date={appointmentData.date}
            time={appointmentData.time}
            client={appointmentData.client}
            appointmentData={appointmentData}
          />

          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            
            <ConfirmationActions
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Confirmation;
