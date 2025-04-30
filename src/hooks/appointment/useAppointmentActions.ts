
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AppointmentStatus } from "@/types/appointment.types";

export const useAppointmentActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to invalidate all appointment-related queries and force refetch
  const invalidateQueries = async () => {
    try {
      console.log("🔄 Invalidating and refreshing all appointment-related queries...");
      
      // First, invalidate using the predicate approach to catch all variants with filters
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          if (Array.isArray(query.queryKey)) {
            return query.queryKey.some(key => 
              typeof key === 'string' && 
              (key.includes('appointment') || key.includes('agendamento') || key.includes('dashboard'))
            );
          }
          return false;
        }
      });
      
      // Then specifically invalidate the ones we know about
      const specificQueries = [
        'appointments',
        'dashboard-appointments',
        'weekly-appointments',
        'week-appointments',
        'dashboard-data',
        'upcoming-appointments'
      ];
      
      await Promise.all(
        specificQueries.map(query => 
          queryClient.invalidateQueries({ queryKey: [query] })
        )
      );
      
      // Force immediate refetch of critical queries
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['appointments'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['weekly-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard-data'] }),
        queryClient.refetchQueries({ queryKey: ['upcoming-appointments'] })
      ]);
      
      console.log("✅ All appointment data refreshed successfully");
      return true;
    } catch (error) {
      console.error("❌ Error invalidating queries:", error);
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
      console.log(`✅ Completing appointment: ${appointmentId}`);
      
      // Update appointment status
      const { data, error: updateError } = await supabase
        .from("agendamentos")
        .update({ status: "concluido" })
        .eq("id", appointmentId)
        .select(); // Important to confirm the update

      if (updateError) throw updateError;
      if (!data || data.length === 0) throw new Error("Nenhum agendamento foi atualizado");
      
      console.log("✓ Status update result:", data);

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
        console.warn("⚠️ Failed to record history:", historyError);
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
      console.error("❌ Error completing appointment:", error);
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
      const reasonText = reason || "Não especificado";
      console.log(`❌ Canceling appointment: ${appointmentId}, reason: ${reasonText}`);
      
      // Update appointment status
      const { data, error: updateError } = await supabase
        .from("agendamentos")
        .update({ 
          status: "cancelado", 
          motivo_cancelamento: reasonText 
        })
        .eq("id", appointmentId)
        .select();

      if (updateError) throw updateError;
      if (!data || data.length === 0) throw new Error("Nenhum agendamento foi atualizado");
      
      console.log("✓ Status update result:", data);

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
        console.warn("⚠️ Failed to record history:", historyError);
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
      console.error("❌ Error canceling appointment:", error);
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
      console.log(`🔄 Rescheduling: ${appointmentId} to ${newDate} at ${newTime}`);
      
      // Update appointment date and time
      const { data, error: updateError } = await supabase
        .from("agendamentos")
        .update({ 
          data: newDate,
          hora: newTime
        })
        .eq("id", appointmentId)
        .select();

      if (updateError) throw updateError;
      if (!data || data.length === 0) throw new Error("Nenhum agendamento foi atualizado");
      
      console.log("✓ Reschedule update result:", data);

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
        console.warn("⚠️ Failed to record history:", historyError);
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
      console.error("❌ Error rescheduling appointment:", error);
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
      console.log(`🗑️ Deleting appointment: ${appointmentId}`);
      
      // Delete history entries first
      const { error: historyError } = await supabase
        .from("agendamento_historico")
        .delete()
        .eq("agendamento_id", appointmentId);

      if (historyError) {
        console.warn("⚠️ Failed to delete history:", historyError);
        // Continue despite history error
      }

      // Delete the appointment
      const { data, error: deleteError } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id", appointmentId)
        .select();

      if (deleteError) throw deleteError;
      
      console.log("✓ Delete result:", data);
      
      // Invalidate and refetch queries
      await invalidateQueries();
      
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído permanentemente.",
      });
      
      return true;
    } catch (error: any) {
      console.error("❌ Error deleting appointment:", error);
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
