
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentNotifications } from "../useAppointmentNotifications";
import { useAppointmentCacheInvalidation } from "./useAppointmentCache";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";

/**
 * Hook for handling appointment completion operations
 */
export const useCompleteAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { invalidateQueries } = useAppointmentCacheInvalidation();
  const { showStatusUpdateSuccess, showStatusUpdateError } = useAppointmentNotifications();
  const { updateStatus } = useUpdateAppointmentStatus();

  // Complete an appointment - usando a função unificada
  const completeAppointment = async (appointmentId: string): Promise<boolean> => {
    if (!appointmentId) {
      showStatusUpdateError("ID de agendamento inválido");
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log(`✅ Completing appointment: ${appointmentId}`);
      
      // Usar a função unificada de atualização de status
      const success = await updateStatus(appointmentId, "concluido");

      if (!success) {
        throw new Error("Erro ao concluir o agendamento");
      }
      
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
