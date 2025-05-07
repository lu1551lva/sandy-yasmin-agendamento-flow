
import { useState } from "react";
import { useAppointmentNotifications } from "../useAppointmentNotifications";
import { useAppointmentCacheInvalidation } from "./useAppointmentCache";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";

/**
 * Hook for handling appointment cancellation operations
 */
export const useCancelAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showStatusUpdateSuccess, showStatusUpdateError } = useAppointmentNotifications();
  const { invalidateQueries } = useAppointmentCacheInvalidation();
  const { updateStatus } = useUpdateAppointmentStatus();

  // Cancel an appointment - usando a função unificada
  const cancelAppointment = async (appointmentId: string, reason: string = ""): Promise<boolean> => {
    if (!appointmentId) {
      showStatusUpdateError("ID de agendamento inválido");
      return false;
    }

    setIsLoading(true);
    
    try {
      const reasonText = reason || "Não especificado";
      console.log(`❌ Canceling appointment: ${appointmentId}, reason: ${reasonText}`);
      
      // Usar a função unificada de atualização de status
      const success = await updateStatus(appointmentId, "cancelado", reasonText);

      if (!success) {
        throw new Error("Erro ao cancelar o agendamento");
      }
      
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
