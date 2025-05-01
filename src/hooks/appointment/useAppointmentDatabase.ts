import { useAppointmentDeletion } from './database/useAppointmentDeletion';
import { AppointmentStatus } from '@/types/appointment.types';
import { formatISO } from 'date-fns';
import { supabase } from "@/lib/supabase";
import { logDatabaseOperation, logAppointmentError } from "@/utils/debugUtils";

/**
 * Hook for database operations related to appointments
 */
export const useAppointmentDatabase = () => {
  const { deleteAppointmentWithHistory } = useAppointmentDeletion();
  
  /**
   * Updates the status of an appointment
   */
  const updateAppointmentStatus = async (
    appointmentId: string, 
    status: AppointmentStatus,
    reason?: string
  ) => {
    try {
      console.log(`Updating appointment ${appointmentId} status to ${status}`);
      
      const updates: { status: AppointmentStatus; motivo_cancelamento?: string } = { status };
      if (reason) {
        updates.motivo_cancelamento = reason;
      }
      
      const { data, error } = await supabase
        .from('agendamentos')
        .update(updates)
        .eq('id', appointmentId)
        .select();
      
      if (error) {
        logAppointmentError('Erro ao atualizar status do agendamento', appointmentId, error);
        return { success: false, error };
      }
      
      logDatabaseOperation('UPDATE', 'agendamentos', { success: true, appointmentId, status, reason });
      console.log(`Appointment ${appointmentId} status updated successfully`);
      
      return { success: true, data };
    } catch (error: any) {
      logAppointmentError('Erro ao atualizar status do agendamento', appointmentId, error);
      return { success: false, error };
    }
  };
  
  /**
   * Creates a history entry for an appointment
   */
  const createHistoryEntry = async (
    appointmentId: string,
    tipo: string,
    descricao: string,
    novoValor?: string,
    status?: string
  ) => {
    try {
      console.log(`Creating history entry for appointment ${appointmentId}`);
      
      const { data, error } = await supabase
        .from('agendamento_historico')
        .insert([
          { 
            agendamento_id: appointmentId, 
            tipo, 
            descricao, 
            novo_valor: novoValor,
            status
          }
        ])
        .select();
      
      if (error) {
        logAppointmentError('Erro ao criar histórico do agendamento', appointmentId, error);
        return { success: false, error };
      }
      
      logDatabaseOperation('INSERT', 'agendamento_historico', { success: true, appointmentId, tipo, descricao, novoValor });
      console.log(`History entry created successfully for appointment ${appointmentId}`);
      
      return { success: true, data };
    } catch (error: any) {
      logAppointmentError('Erro ao criar histórico do agendamento', appointmentId, error);
      return { success: false, error };
    }
  };
  
  /**
   * Reschedules an appointment
   */
  const rescheduleAppointment = async (
    appointmentId: string,
    date: Date,
    time: string,
    professionalId?: string,
    rescheduleNote?: string
  ) => {
    try {
      console.log(`Rescheduling appointment ${appointmentId} to ${date} at ${time}`);
      
      const formattedDate = formatISO(date, { representation: 'date' });
      
      const { data, error } = await supabase
        .from('agendamentos')
        .update({ data: formattedDate, hora: time, profissional_id: professionalId })
        .eq('id', appointmentId)
        .select();
      
      if (error) {
        logAppointmentError('Erro ao reagendar agendamento', appointmentId, error);
        return { success: false, error };
      }
      
      logDatabaseOperation('UPDATE', 'agendamentos', { success: true, appointmentId, date, time, professionalId });
      console.log(`Appointment ${appointmentId} rescheduled successfully`);
      
      return { success: true, data };
    } catch (error: any) {
      logAppointmentError('Erro ao reagendar agendamento', appointmentId, error);
      return { success: false, error };
    }
  };
  
  return {
    updateAppointmentStatus,
    createHistoryEntry,
    rescheduleAppointment,
    deleteAppointmentWithHistory
  };
};
