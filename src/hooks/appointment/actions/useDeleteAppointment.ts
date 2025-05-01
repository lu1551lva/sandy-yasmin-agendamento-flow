
import { useState } from "react";
import { useAppointmentNotifications } from "../useAppointmentNotifications";
import { useAppointmentCacheInvalidation } from "./useAppointmentCache";
import { useAppointmentDatabase } from "../useAppointmentDatabase";

/**
 * Hook for handling appointment deletion operations
 */
export const useDeleteAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showDeleteSuccess, showDeleteError } = useAppointmentNotifications();
  const { invalidateQueries } = useAppointmentCacheInvalidation();
  const { deleteAppointmentWithHistory } = useAppointmentDatabase();

  // Delete an appointment
  const deleteAppointment = async (appointmentId: string): Promise<boolean> => {
    if (!appointmentId) {
      showDeleteError("ID de agendamento inválido");
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log(`🗑️ Deleting appointment: ${appointmentId}`);
      
      // Use the deleteAppointmentWithHistory function
      const { success, error } = await deleteAppointmentWithHistory(appointmentId);

      if (!success) {
        console.error("❌ Error deleting appointment:", error);
        throw error || new Error("Failed to delete appointment");
      }
      
      console.log("✓ Delete result successful");
      
      // Invalidate and refetch queries
      await invalidateQueries();
      
      showDeleteSuccess();
      
      return true;
    } catch (error: any) {
      console.error("❌ Error deleting appointment:", error);
      showDeleteError(error.message || "Ocorreu um erro inesperado");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteAppointment,
    isLoading
  };
};
