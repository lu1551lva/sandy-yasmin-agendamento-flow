
import { supabase } from "@/lib/supabase";
import { AppointmentStatus } from "@/types/appointment.types";
import { 
  logDatabaseOperation,
  logAppointmentError,
  logAppointmentAction
} from "@/utils/debugUtils";
import { DatabaseResult } from "./useAppointmentTypes";

/**
 * Hook for handling database operations related to appointments
 */
export const useAppointmentDatabase = () => {
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

  /**
   * Reschedules an appointment in the database
   * @param appointmentId - The ID of the appointment to reschedule
   * @param date - The new date
   * @param time - The new time
   */
  const rescheduleAppointment = async (
    appointmentId: string,
    date: Date,
    time: string
  ): Promise<DatabaseResult> => {
    if (!appointmentId || appointmentId.trim() === '') {
      logAppointmentError('ID de agendamento inválido para reagendamento', appointmentId || 'null');
      return { 
        data: null, 
        error: new Error('ID de agendamento inválido'), 
        success: false 
      };
    }

    const formattedDate = date instanceof Date 
      ? date.toISOString().split('T')[0]
      : date;

    const updateData = { 
      data: formattedDate, 
      hora: time 
    };

    logAppointmentAction('Executando reagendamento no banco', appointmentId, updateData);

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
      logAppointmentError('Erro inesperado ao reagendar', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  /**
   * Creates a history entry for an appointment status change
   */
  const createHistoryEntry = async (
    appointmentId: string,
    tipo: string,
    descricao: string,
    valorAnterior?: string,
    novoValor?: string,
    observacao?: string
  ): Promise<DatabaseResult> => {
    const historyEntry = {
      agendamento_id: appointmentId,
      tipo,
      descricao,
      ...(valorAnterior && { valor_anterior: valorAnterior }),
      ...(novoValor && { novo_valor: novoValor }),
      ...(observacao && { observacao }),
    };

    logAppointmentAction("Inserindo histórico", appointmentId, historyEntry);

    try {
      const { data, error } = await supabase
        .from('agendamento_historico')
        .insert(historyEntry)
        .select();
      
      logDatabaseOperation('INSERT', 'agendamento_historico', { data, error });
      
      return { 
        data, 
        error, 
        success: !error 
      };
    } catch (error) {
      logAppointmentError('Erro ao criar histórico', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  /**
   * Deletes an appointment and its history
   */
  const deleteAppointmentWithHistory = async (appointmentId: string): Promise<DatabaseResult> => {
    try {
      // Delete history first
      const { error: historyError } = await supabase
        .from('agendamento_historico')
        .delete()
        .eq('agendamento_id', appointmentId);
      
      logDatabaseOperation('DELETE', 'agendamento_historico', { error: historyError });

      if (historyError) {
        return {
          data: null,
          error: historyError,
          success: false
        };
      }

      // Then delete the appointment
      const { data, error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', appointmentId)
        .select();
      
      logDatabaseOperation('DELETE', 'agendamentos', { data, error });

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

  /**
   * Fetches appointment history by appointment ID
   */
  const getAppointmentHistory = async (appointmentId: string): Promise<DatabaseResult> => {
    try {
      const { data, error } = await supabase
        .from('agendamento_historico')
        .select('*')
        .eq('agendamento_id', appointmentId)
        .order('created_at', { ascending: false });
      
      logDatabaseOperation('SELECT', 'agendamento_historico', { data, error });
      
      return {
        data,
        error,
        success: !error
      };
    } catch (error) {
      logAppointmentError('Erro ao buscar histórico do agendamento', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  return {
    updateAppointmentStatus,
    rescheduleAppointment,
    createHistoryEntry,
    deleteAppointmentWithHistory,
    getAppointmentById,
    getAppointmentHistory
  };
};
