
import { supabase } from "@/lib/supabase";
import { 
  logDatabaseOperation,
  logAppointmentError
} from "@/utils/debugUtils";
import { DatabaseResult } from "../useAppointmentTypes";

/**
 * Hook for fetching appointment details from the database
 */
export const useAppointmentDetails = () => {
  /**
   * Fetches appointment details by ID
   */
  const getAppointmentById = async (appointmentId: string): Promise<DatabaseResult> => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*),
          profissional:profissionais(*)
        `)
        .eq('id', appointmentId)
        .single();
      
      logDatabaseOperation('SELECT', 'agendamentos', { data, error });
      
      return {
        data,
        error,
        success: !error && data !== null
      };
    } catch (error) {
      logAppointmentError('Erro ao buscar detalhes do agendamento', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  return { getAppointmentById };
};
