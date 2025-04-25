
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { AppointmentData } from "../types/confirmation.types";

export const useConfirmation = () => {
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConfirmation = async (
    appointmentData: AppointmentData,
    setIsSubmitting: (value: boolean) => void,
    setIsComplete: (value: boolean) => void
  ) => {
    if (!appointmentData.service || !appointmentData.date || !appointmentData.time || !appointmentData.client) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os dados do agendamento.",
        variant: "destructive",
      });
      return;
    }

    // Use either the professional_id field or professionalId field
    const professionalId = appointmentData.professional_id || appointmentData.professionalId;
    
    if (!professionalId) {
      toast({
        title: "Profissional não selecionado",
        description: "Por favor, selecione um profissional para o agendamento.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First check if we need to create a new client or use an existing one
      let clientId = appointmentData.client.id;
      
      if (!clientId) {
        const { data: existingClient, error: checkError } = await supabase
          .from("clientes")
          .select("*")
          .eq("telefone", appointmentData.client.telefone)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        if (existingClient) {
          clientId = existingClient.id;
        } else {
          const clientData = {
            nome: appointmentData.client.nome,
            telefone: appointmentData.client.telefone,
            email: appointmentData.client.email,
          };
          
          const { data: newClient, error: clientError } = await supabase
            .from("clientes")
            .insert(clientData)
            .select()
            .single();

          if (clientError) throw clientError;
          clientId = newClient.id;
        }
      }

      // Create appointment data with explicit professional_id
      const appointmentRecord = {
        cliente_id: clientId,
        servico_id: appointmentData.service.id,
        profissional_id: professionalId,
        data: appointmentData.date,
        hora: appointmentData.time,
        status: "agendado",
      };

      const { data: appointment, error: appointmentError } = await supabase
        .from("agendamentos")
        .insert(appointmentRecord)
        .select()
        .single();

      if (appointmentError) throw appointmentError;

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

  return {
    appointmentId,
    handleConfirmation
  };
};
