import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { AppointmentData } from "../types/confirmation.types";

export const useConfirmation = () => {
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const { toast } = useToast();

  const findOrCreateClient = async (client: AppointmentData["client"]) => {
    if (!client.telefone) {
      throw new Error("Telefone do cliente é obrigatório.");
    }

    const { data: existingClient, error: checkError } = await supabase
      .from("clientes")
      .select("*")
      .eq("telefone", client.telefone)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingClient) {
      return existingClient.id;
    }

    const { data: newClient, error: clientError } = await supabase
      .from("clientes")
      .insert({
        nome: client.nome,
        telefone: client.telefone,
        email: client.email,
      })
      .select()
      .single();

    if (clientError) {
      throw clientError;
    }

    if (!newClient?.id) {
      throw new Error("Erro ao criar novo cliente.");
    }

    return newClient.id;
  };

  const createAppointment = async (appointmentData: AppointmentData, clientId: string) => {
    const professionalId = appointmentData.professional_id || appointmentData.professionalId;
    
    if (!professionalId) {
      throw new Error("Profissional não selecionado.");
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from("agendamentos")
      .insert({
        cliente_id: clientId,
        servico_id: appointmentData.service.id,
        profissional_id: professionalId,
        data: appointmentData.date,
        hora: appointmentData.time,
        status: "agendado",
      })
      .select()
      .single();

    if (appointmentError) {
      throw appointmentError;
    }

    if (!appointment?.id) {
      throw new Error("Erro ao criar agendamento.");
    }

    return appointment.id;
  };

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

    setIsSubmitting(true);

    try {
      const clientId = appointmentData.client.id || await findOrCreateClient(appointmentData.client);
      const newAppointmentId = await createAppointment(appointmentData, clientId);

      setAppointmentId(newAppointmentId);
      setIsComplete(true);
    } catch (error: unknown) {
      console.error("Erro ao confirmar agendamento:", error);

      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
      toast({
        title: "Erro ao confirmar agendamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    appointmentId,
    handleConfirmation,
  };
};
