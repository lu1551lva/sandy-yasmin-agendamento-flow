
import { useState } from 'react';
import { format } from 'date-fns';
import { useAppointmentDatabase } from './appointment/useAppointmentDatabase';
import { useAppointmentCache } from './appointment/useAppointmentCache';
import { useAppointmentNotifications } from './appointment/useAppointmentNotifications';
import { 
  logAppointmentAction, 
  logAppointmentError, 
  traceAppointmentFlow,
  validateAppointmentId,
  logStackTrace
} from '@/utils/debugUtils';

export const useRescheduleAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { 
    rescheduleAppointment, 
    createHistoryEntry 
  } = useAppointmentDatabase();

  const { 
    invalidateAppointmentQueries 
  } = useAppointmentCache();

  const { 
    showRescheduleSuccess, 
    showRescheduleError,
    showHistoryWarning 
  } = useAppointmentNotifications();

  /**
   * Reschedules an appointment to a new date and time
   */
  const reschedule = async (
    appointmentId: string,
    date: Date,
    time: string,
    professionalId: string,
    note?: string
  ): Promise<boolean> => {
    logStackTrace("rescheduleAppointment chamado");
    
    // Validate appointment ID
    if (!validateAppointmentId(appointmentId)) {
      showRescheduleError("ID de agendamento inválido. Por favor, tente novamente.");
      return false;
    }

    // Validate other required parameters
    if (!date || !time || !professionalId) {
      showRescheduleError("Data, hora e profissional são obrigatórios para reagendamento.");
      return false;
    }

    setIsLoading(true);
    traceAppointmentFlow("Iniciando reagendamento", appointmentId, { date: format(date, 'yyyy-MM-dd'), time });

    try {
      // Update the appointment in the database using our refactored hook
      const result = await rescheduleAppointment(
        appointmentId,
        date,
        time
      );

      if (!result.success) {
        logAppointmentError("Falha ao reagendar agendamento", appointmentId, result.error);
        showRescheduleError(result.error?.message || "Não foi possível reagendar o agendamento.");
        return false;
      }

      logAppointmentAction("Reagendamento bem-sucedido", appointmentId, { 
        date: format(date, 'yyyy-MM-dd'), 
        time 
      });

      // Create history entry for the rescheduling using our refactored hook
      const formattedDate = format(date, 'yyyy-MM-dd');
      const observacao = note ? `Observação: ${note}` : undefined;
      const historyResult = await createHistoryEntry(
        appointmentId,
        'reagendado',
        'Agendamento reagendado',
        'anterior',
        `${formattedDate} ${time}`,
        observacao
      );

      if (!historyResult.success) {
        logAppointmentError("Erro ao registrar histórico de reagendamento", appointmentId, historyResult.error);
        showHistoryWarning();
      }

      // Show success notification and update cache
      showRescheduleSuccess();
      await invalidateAppointmentQueries();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      logAppointmentError("Erro inesperado ao reagendar", appointmentId, error);
      showRescheduleError(`Erro: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rescheduleAppointment: reschedule,
    isLoading
  };
};
