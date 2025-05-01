
import { supabase } from "@/lib/supabase";
import { 
  logDatabaseOperation,
  logAppointmentError
} from "@/utils/debugUtils";
import { DatabaseResult } from "../useAppointmentTypes";

/**
 * Hook for handling appointment deletion operations in the database
 */
export const useAppointmentDeletion = () => {
  /**
   * Deletes an appointment and its history
   */
  const deleteAppointmentWithHistory = async (appointmentId: string): Promise<DatabaseResult> => {
    try {
      // Log the deletion attempt
      console.log(`🗑️ Attempting to delete appointment: ${appointmentId}`);
      
      // Use the improved database function to delete the appointment and its history
      const { data, error } = await supabase
        .rpc('delete_appointment_with_history', {
          appointment_id: appointmentId
        });
      
      if (error) {
        console.error("❌ Error deleting appointment:", error);
        return {
          data: null,
          error,
          success: false
        };
      }
      
      logDatabaseOperation('RPC', 'delete_appointment_with_history', { success: true, appointmentId });
      console.log(`✅ Successfully deleted appointment: ${appointmentId}`);

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      logAppointmentError('Erro ao excluir agendamento e histórico', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  return { deleteAppointmentWithHistory };
};
