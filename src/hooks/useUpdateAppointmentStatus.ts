
import { useState } from 'react';
import { AppointmentStatus } from '@/types/appointment.types';
import { useAppointmentDatabase } from './appointment/useAppointmentDatabase';
import { useAppointmentCache } from './appointment/useAppointmentCache';
import { useAppointmentNotifications } from './appointment/useAppointmentNotifications';
import { 
  logAppointmentAction, 
  logAppointmentError, 
  traceAppointmentFlow, 
  validateAppointmentId 
} from '@/utils/debugUtils';

export const useUpdateAppointmentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { 
    updateAppointmentStatus, 
    createHistoryEntry, 
    deleteAppointmentWithHistory 
  } = useAppointmentDatabase();

  const { 
    invalidateAppointmentQueries, 
    invalidateAppointmentHistory 
  } = useAppointmentCache();

  const { 
    showStatusUpdateSuccess, 
    showStatusUpdateError, 
    showDeleteSuccess, 
    showDeleteError, 
    showHistoryWarning, 
    showCacheError 
  } = useAppointmentNotifications();

  const handleError = (message: string, appointmentId: string = 'unknown', error?: unknown) => {
    if (error) {
      logAppointmentError(message, appointmentId, error);
    } else {
      logAppointmentError(message, appointmentId);
    }
  };

  const handleCacheInvalidation = async (appointmentId: string) => {
    const cacheSuccess = await invalidateAppointmentQueries();
    if (!cacheSuccess) {
      showCacheError();
    }
    await invalidateAppointmentHistory(appointmentId);
  };

  const updateStatus = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    if (!validateAppointmentId(appointmentId)) {
      showStatusUpdateError("ID de agendamento inválido. Por favor, tente novamente.");
      return false;
    }

    setIsLoading(true);
    traceAppointmentFlow("Iniciando atualização", appointmentId, { status });

    try {
      const result = await updateAppointmentStatus(appointmentId, status, reason);

      if (result.error || !result.data) {
        const message = result.error 
          ? `Não foi possível atualizar o status: ${result.error.message}` 
          : "O agendamento não foi encontrado ou não pôde ser atualizado.";
        
        handleError("Erro ao atualizar agendamento", appointmentId, result.error);
        showStatusUpdateError(message);
        return false;
      }

      logAppointmentAction("Status atualizado com sucesso", appointmentId, { novoStatus: status });

      const description = `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`;
      const historyResult = await createHistoryEntry(appointmentId, status, description);

      if (historyResult.error) {
        handleError("Erro ao registrar histórico", appointmentId, historyResult.error);
        showHistoryWarning();
      } else {
        logAppointmentAction("Histórico registrado", appointmentId);
      }

      showStatusUpdateSuccess(status);
      await handleCacheInvalidation(appointmentId);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      handleError("Erro geral na atualização", appointmentId, errorMessage);
      showStatusUpdateError(`Erro: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!validateAppointmentId(appointmentId)) {
      showDeleteError("ID de agendamento inválido. Por favor, tente novamente.");
      return false;
    }

    setIsLoading(true);
    traceAppointmentFlow("Iniciando exclusão", appointmentId);

    try {
      const { historyResult, appointmentResult } = await deleteAppointmentWithHistory(appointmentId);

      if (historyResult.error) {
        handleError("Erro ao excluir histórico", appointmentId, historyResult.error);
        showDeleteError(`Erro ao excluir histórico: ${historyResult.error.message}`);
      }

      if (appointmentResult.error) {
        handleError("Erro ao excluir agendamento", appointmentId, appointmentResult.error);
        showDeleteError(`Não foi possível excluir o agendamento: ${appointmentResult.error.message}`);
        return false;
      }

      logAppointmentAction("Exclusão bem-sucedida", appointmentId);
      showDeleteSuccess();

      await invalidateAppointmentQueries();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      handleError("Erro geral na exclusão", appointmentId, errorMessage);
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
