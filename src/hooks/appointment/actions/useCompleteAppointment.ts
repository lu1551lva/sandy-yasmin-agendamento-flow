
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentNotifications } from "../useAppointmentNotifications";
import { useAppointmentCacheInvalidation } from "./useAppointmentCache";

/**
 * Hook for handling appointment completion operations
 */
export const useCompleteAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { invalidateQueries } = useAppointmentCacheInvalidation();
  const { showStatusUpdateSuccess, showStatusUpdateError } = useAppointmentNotifications();

  // Complete an appointment
  const completeAppointment = async (appointmentId: string): Promise<boolean> => {
    if (!appointmentId) {
      showStatusUpdateError("ID de agendamento inválido");
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
        .select();

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
      
      showStatusUpdateSuccess("concluido");
      
      return true;
    } catch (error: any) {
      console.error("❌ Error completing appointment:", error);
      showStatusUpdateError(error.message || "Ocorreu um erro inesperado");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    completeAppointment,
    isLoading
  };
};
