
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
      // Usar a função SQL que criamos para excluir o agendamento e seu histórico
      const { data, error } = await supabase
        .rpc('delete_appointment_with_history', {
          appointment_id: appointmentId
        });
      
      logDatabaseOperation('RPC', 'delete_appointment_with_history', { data, error });

      return {
        data,
        error,
        success: !error
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
