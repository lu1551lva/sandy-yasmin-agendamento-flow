
import { useState } from 'react';
import { AppointmentStatus } from '@/types/appointment.types';
import { useAppointmentDatabase } from './appointment/useAppointmentDatabase';
import { useAppointmentCache } from './appointment/useAppointmentCache';
import { useAppointmentNotifications } from './appointment/useAppointmentNotifications';
import { logAppointmentAction, logAppointmentError, traceAppointmentFlow, validateAppointmentId } from '@/utils/debugUtils';

export const useUpdateAppointmentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateAppointmentStatus, createHistoryEntry, deleteAppointmentWithHistory } = useAppointmentDatabase();
  const { invalidateAppointmentQueries, invalidateAppointmentHistory } = useAppointmentCache();
  const { 
    showStatusUpdateSuccess, 
    showStatusUpdateError, 
    showDeleteSuccess, 
    showDeleteError,
    showHistoryWarning,
    showCacheError 
  } = useAppointmentNotifications();

  /**
   * Updates the status of an appointment in the database
   */
  const updateStatus = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    try {
      if (!validateAppointmentId(appointmentId)) {
        showStatusUpdateError("ID de agendamento inválido. Por favor, tente novamente.");
        return false;
      }

      traceAppointmentFlow(`Iniciando atualização`, appointmentId, { status });
      setIsLoading(true);

      // Update appointment status in the database
      const { data, error } = await updateAppointmentStatus(appointmentId, status, reason);

      if (error) {
        logAppointmentError("Erro do Supabase na atualização", appointmentId, error);
        showStatusUpdateError(`Não foi possível atualizar o status do agendamento: ${error.message}`);
        return false;
      }

      if (!data || data.length === 0) {
        logAppointmentError("Agendamento não encontrado ou não atualizado", appointmentId);
        showStatusUpdateError("O agendamento não foi encontrado ou não pôde ser atualizado.");
        return false;
      }

      logAppointmentAction("Update realizado com sucesso", appointmentId, { novoStatus: status });

      // Create history entry
      const description = `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`;
      const { error: historyError } = await createHistoryEntry(appointmentId, status, description);

      if (historyError) {
        logAppointmentError("Erro ao registrar histórico", appointmentId, historyError);
        showHistoryWarning();
      } else {
        logAppointmentAction("Histórico registrado", appointmentId);
      }

      // Show success notification
      showStatusUpdateSuccess(status);

      // Update UI
      logAppointmentAction("Atualizando interface", appointmentId);
      const cacheSuccess = await invalidateAppointmentQueries();
      if (!cacheSuccess) {
        showCacheError();
      }
      
      await invalidateAppointmentHistory(appointmentId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      logAppointmentError("Erro geral na atualização", appointmentId || 'unknown', errorMessage);
      showStatusUpdateError(`Erro: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes an appointment and its history
   */
  const deleteAppointment = async (appointmentId: string) => {
    try {
      if (!validateAppointmentId(appointmentId)) {
        showDeleteError("ID de agendamento inválido. Por favor, tente novamente.");
        return false;
      }

      setIsLoading(true);
      traceAppointmentFlow(`Iniciando exclusão`, appointmentId);

      const { historyResult, appointmentResult } = await deleteAppointmentWithHistory(appointmentId);

      if (historyResult.error) {
        logAppointmentError("Erro ao excluir histórico", appointmentId, historyResult.error);
        showDeleteError(`Erro ao excluir histórico: ${historyResult.error.message}`);
      }

      if (appointmentResult.error) {
        logAppointmentError("Erro ao excluir agendamento", appointmentId, appointmentResult.error);
        showDeleteError(`Não foi possível excluir o agendamento: ${appointmentResult.error.message}`);
        return false;
      }

      logAppointmentAction("Exclusão bem-sucedida", appointmentId);
      showDeleteSuccess();

      logAppointmentAction("Atualizando interface após exclusão", appointmentId);
      await invalidateAppointmentQueries();

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      logAppointmentError("Erro geral na exclusão", appointmentId || 'unknown', errorMessage);
      showDeleteError(`Erro: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateStatus,
    deleteAppointment,
    isLoading,
  };
};
