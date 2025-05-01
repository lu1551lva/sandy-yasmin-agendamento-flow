
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppointmentNotifications } from "../useAppointmentNotifications";
import { useAppointmentCacheInvalidation } from "./useAppointmentCache";

/**
 * Hook for handling appointment rescheduling operations
 */
export const useRescheduleAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showRescheduleSuccess, showRescheduleError } = useAppointmentNotifications();
  const { invalidateQueries } = useAppointmentCacheInvalidation();

  // Reschedule an appointment
  const rescheduleAppointment = async (appointmentId: string, newDate: string, newTime: string): Promise<boolean> => {
    if (!appointmentId || !newDate || !newTime) {
      showRescheduleError("Informações de reagendamento inválidas");
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
      
      showRescheduleSuccess();
      
      return true;
    } catch (error: any) {
      console.error("❌ Error rescheduling appointment:", error);
      showRescheduleError(error.message || "Ocorreu um erro inesperado");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rescheduleAppointment,
    isLoading
  };
};
