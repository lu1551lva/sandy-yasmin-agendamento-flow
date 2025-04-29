
import { supabase } from '@/lib/supabase';
import { AppointmentStatus } from '@/types/appointment.types';
import { 
  logDatabaseOperation,
  logAppointmentError,
  logAppointmentAction,
} from '@/utils/debugUtils';

/**
 * Handles database operations for appointment status updates
 */
export const useAppointmentDatabase = () => {
  /**
   * Updates an appointment's status in the database
   */
  const updateAppointmentStatus = async (
    appointmentId: string, 
    status: AppointmentStatus, 
    reason?: string
  ) => {
    if (!appointmentId || appointmentId.trim() === '') {
      logAppointmentError('ID de agendamento inválido para atualização de status', appointmentId || 'null');
      return { error: new Error('ID de agendamento inválido') };
    }

    const updateData: Record<string, any> = { status };
    
    if (reason && status === 'cancelado') {
      updateData['motivo_cancelamento'] = reason;
      logAppointmentAction(`Adicionando motivo de cancelamento`, appointmentId, { motivo: reason });
    }

    logAppointmentAction('Executando update no banco', appointmentId, { updateData });

    const result = await supabase
      .from('agendamentos')
      .update(updateData)
      .eq('id', appointmentId)
      .select();
    
    logDatabaseOperation('UPDATE', 'agendamentos', result);
    
    return result;
  };

  /**
   * Creates a history entry for an appointment status change
   */
  const createHistoryEntry = async (
    appointmentId: string,
    status: AppointmentStatus,
    description: string
  ) => {
    const historyEntry = {
      agendamento_id: appointmentId,
      tipo: status,
      descricao: description,
      novo_valor: status,
    };

    logAppointmentAction("Inserindo histórico", appointmentId, historyEntry);

    const result = await supabase
      .from('agendamento_historico')
      .insert(historyEntry);
    
    logDatabaseOperation('INSERT', 'agendamento_historico', result);
    
    return result;
  };

  /**
   * Deletes an appointment and its history
   */
  const deleteAppointmentWithHistory = async (appointmentId: string) => {
    // Delete history first
    const historyResult = await supabase
      .from('agendamento_historico')
      .delete()
      .eq('agendamento_id', appointmentId);
    
    logDatabaseOperation('DELETE', 'agendamento_historico', historyResult);

    // Then delete the appointment
    const appointmentResult = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', appointmentId);
    
    logDatabaseOperation('DELETE', 'agendamentos', appointmentResult);

    return {
      historyResult,
      appointmentResult
    };
  };

  return {
    updateAppointmentStatus,
    createHistoryEntry,
    deleteAppointmentWithHistory
  };
};
