
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppointmentNotifications } from "../useAppointmentNotifications";
import { useAppointmentCacheInvalidation } from "./useAppointmentCache";

/**
 * Hook for handling appointment cancellation operations
 */
export const useCancelAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showStatusUpdateSuccess, showStatusUpdateError } = useAppointmentNotifications();
  const { invalidateQueries } = useAppointmentCacheInvalidation();

  // Cancel an appointment
  const cancelAppointment = async (appointmentId: string, reason: string = ""): Promise<boolean> => {
    if (!appointmentId) {
      showStatusUpdateError("ID de agendamento inválido");
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
      
      showStatusUpdateSuccess("cancelado");
      
      return true;
    } catch (error: any) {
      console.error("❌ Error canceling appointment:", error);
      showStatusUpdateError(error.message || "Ocorreu um erro inesperado");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cancelAppointment,
    isLoading
  };
};
