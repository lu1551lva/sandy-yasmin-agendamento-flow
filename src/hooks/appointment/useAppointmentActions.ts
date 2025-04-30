
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AppointmentStatus } from "@/types/appointment.types";

export const useAppointmentActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to invalidate all appointment-related queries
  const invalidateQueries = async () => {
    try {
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          if (Array.isArray(query.queryKey)) {
            return query.queryKey.some(key => 
              typeof key === 'string' && 
              (key.includes('appointment') || key.includes('agendamento'))
            );
          }
          return false;
        }
      });
      
      // Force refetch of critical queries
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['appointments'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['weekly-appointments'] }),
      ]);
      
      return true;
    } catch (error) {
      console.error("Error invalidating queries:", error);
      return false;
    }
  };

  // Complete an appointment
  const completeAppointment = async (appointmentId: string) => {
    if (!appointmentId) {
      toast({
        title: "Erro",
        description: "ID de agendamento inválido",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log(`Concluindo agendamento: ${appointmentId}`);
      
      // Update appointment status
      const { error: updateError } = await supabase
        .from("agendamentos")
        .update({ status: "concluido" })
        .eq("id", appointmentId);

      if (updateError) throw updateError;

      // Create history entry
      const { error: historyError } = await supabase
        .from("agendamento_historico")
        .insert({ 
          agendamento_id: appointmentId, 
          tipo: "concluido", 
          descricao: "Agendamento concluído", 
          novo_valor: "concluido" 
        });

      if (historyError) {
        console.warn("Erro ao registrar histórico:", historyError);
        // Continue despite history error
      }

      // Invalidate and refetch queries
      await invalidateQueries();
      
      toast({
        title: "Agendamento concluído",
        description: "O agendamento foi marcado como concluído com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao concluir agendamento:", error);
      toast({
        title: "Erro ao concluir",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel an appointment
  const cancelAppointment = async (appointmentId: string, reason: string = "") => {
    if (!appointmentId) {
      toast({
        title: "Erro",
        description: "ID de agendamento inválido",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log(`Cancelando agendamento: ${appointmentId}, motivo: ${reason || "não especificado"}`);
      
      // Prepare reason text
      const reasonText = reason || "Não especificado";
      
      // Update appointment status
      const { error: updateError } = await supabase
        .from("agendamentos")
        .update({ 
          status: "cancelado", 
          motivo_cancelamento: reasonText 
        })
        .eq("id", appointmentId);

      if (updateError) throw updateError;

      // Create history entry
      const { error: historyError } = await supabase
        .from("agendamento_historico")
        .insert({ 
          agendamento_id: appointmentId, 
          tipo: "cancelado", 
          descricao: `Agendamento cancelado - Motivo: ${reasonText}`, 
          novo_valor: "cancelado" 
        });

      if (historyError) {
        console.warn("Erro ao registrar histórico:", historyError);
        // Continue despite history error
      }

      // Invalidate and refetch queries
      await invalidateQueries();
      
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao cancelar agendamento:", error);
      toast({
        title: "Erro ao cancelar",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reschedule an appointment
  const rescheduleAppointment = async (appointmentId: string, newDate: string, newTime: string) => {
    if (!appointmentId || !newDate || !newTime) {
      toast({
        title: "Erro",
        description: "Informações de reagendamento inválidas",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log(`Reagendando: ${appointmentId} para ${newDate} às ${newTime}`);
      
      // Update appointment date and time
      const { error: updateError } = await supabase
        .from("agendamentos")
        .update({ 
          data: newDate,
          hora: newTime
        })
        .eq("id", appointmentId);

      if (updateError) throw updateError;

      // Create history entry
      const { error: historyError } = await supabase
        .from("agendamento_historico")
        .insert({ 
          agendamento_id: appointmentId, 
          tipo: "reagendado", 
          descricao: `Agendamento reagendado para ${newDate} às ${newTime}`, 
          novo_valor: `${newDate} ${newTime}` 
        });

      if (historyError) {
        console.warn("Erro ao registrar histórico:", historyError);
        // Continue despite history error
      }

      // Invalidate and refetch queries
      await invalidateQueries();
      
      toast({
        title: "Agendamento reagendado",
        description: "O agendamento foi reagendado com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao reagendar agendamento:", error);
      toast({
        title: "Erro ao reagendar",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an appointment
  const deleteAppointment = async (appointmentId: string) => {
    if (!appointmentId) {
      toast({
        title: "Erro",
        description: "ID de agendamento inválido",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log(`Excluindo agendamento: ${appointmentId}`);
      
      // Delete history entries first
      const { error: historyError } = await supabase
        .from("agendamento_historico")
        .delete()
        .eq("agendamento_id", appointmentId);

      if (historyError) {
        console.warn("Erro ao excluir histórico:", historyError);
        // Continue despite history error
      }

      // Delete the appointment
      const { error: deleteError } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id", appointmentId);

      if (deleteError) throw deleteError;

      // Invalidate and refetch queries
      await invalidateQueries();
      
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído permanentemente.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir agendamento:", error);
      toast({
        title: "Erro ao excluir",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    completeAppointment,
    cancelAppointment,
    rescheduleAppointment,
    deleteAppointment,
  };
};
