
import { supabase } from "@/lib/supabase";
import { AppointmentStatus } from "@/types/appointment.types";
import { 
  logDatabaseOperation,
  logAppointmentError,
  logAppointmentAction
} from "@/utils/debugUtils";
import { DatabaseResult } from "../useAppointmentTypes";

/**
 * Hook for handling appointment status updates in the database
 */
export const useAppointmentStatus = () => {
  /**
   * Updates an appointment's status in the database
   * @param appointmentId - The ID of the appointment to update
   * @param status - The new status to set
   * @param reason - Optional reason for status change (required for cancellations)
   */
  const updateAppointmentStatus = async (
    appointmentId: string, 
    status: AppointmentStatus, 
    reason?: string
  ): Promise<DatabaseResult> => {
    if (!appointmentId || appointmentId.trim() === '') {
      logAppointmentError('ID de agendamento inválido para atualização de status', appointmentId || 'null');
      return { 
        data: null, 
        error: new Error('ID de agendamento inválido'), 
        success: false 
      };
    }

    const updateData: Record<string, any> = { status };
    
    if (reason && status === 'cancelado') {
      updateData['motivo_cancelamento'] = reason;
      logAppointmentAction(`Adicionando motivo de cancelamento`, appointmentId, { motivo: reason });
    }

    logAppointmentAction('Executando update no banco', appointmentId, { updateData });

    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', appointmentId)
        .select();
      
      logDatabaseOperation('UPDATE', 'agendamentos', { data, error });
      
      return { 
        data, 
        error, 
        success: !error && data !== null 
      };
    } catch (error) {
      logAppointmentError('Erro inesperado ao atualizar status', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  return { updateAppointmentStatus };
};
