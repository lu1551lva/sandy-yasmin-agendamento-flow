
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
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useUpdateAppointmentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  // Direct invalidation of all appointment queries to ensure UI updates
  const forceRefreshAppointments = async () => {
    try {
      // Invalidate all queries with 'appointments' as the first key
      await queryClient.invalidateQueries({
        predicate: (query) => 
          Array.isArray(query.queryKey) && 
          (query.queryKey[0] === 'appointments' || 
           query.queryKey[0] === 'dashboard-appointments' || 
           query.queryKey[0] === 'weekly-appointments')
      });
      
      // Force immediate refetch of the main appointments query
      await queryClient.refetchQueries({
        queryKey: ['appointments'],
        type: 'active',
      });
      
      logAppointmentAction("Todos os caches de agendamentos invalidados e recarregados", "cache-refresh");
      return true;
    } catch (error) {
      logAppointmentError("Erro ao forçar atualização do cache", "cache-refresh", error);
      return false;
    }
  };

  const handleError = (message: string, appointmentId: string = 'unknown', error?: unknown) => {
    if (error) {
      logAppointmentError(message, appointmentId, error);
    } else {
      logAppointmentError(message, appointmentId);
    }
  };

  const handleCacheInvalidation = async (appointmentId: string) => {
    // Use both the original cache invalidation and our direct refresh
    const cacheSuccess = await invalidateAppointmentQueries();
    if (!cacheSuccess) {
      showCacheError();
    }
    await invalidateAppointmentHistory(appointmentId);
    
    // Force refresh regardless of the above result
    await forceRefreshAppointments();
  };

  const updateStatus = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    if (!validateAppointmentId(appointmentId)) {
      showStatusUpdateError("ID de agendamento inválido. Por favor, tente novamente.");
      return false;
    }

    setIsLoading(true);
    traceAppointmentFlow("Iniciando atualização", appointmentId, { status });

    try {
      // Direct database update as a fallback in case the abstraction fails
      const updateData: any = { status };
      if (reason && status === "cancelado") {
        updateData.motivo_cancelamento = reason;
      }
      
      // First try the abstracted method
      const result = await updateAppointmentStatus(appointmentId, status, reason);
      
      // If the abstracted method fails, try direct update
      if (!result.success || !result.data) {
        logAppointmentAction("Tentando atualização direta no banco", appointmentId);
        
        const { error } = await supabase
          .from("agendamentos")
          .update(updateData)
          .eq("id", appointmentId);
          
        if (error) {
          throw new Error(error.message);
        }
      }

      logAppointmentAction("Status atualizado com sucesso", appointmentId, { novoStatus: status });

      const description = `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`;
      const historyResult = await createHistoryEntry(appointmentId, status, description, null, status);

      if (!historyResult.success) {
        handleError("Erro ao registrar histórico", appointmentId, historyResult.error);
        showHistoryWarning();
      } else {
        logAppointmentAction("Histórico registrado", appointmentId);
      }

      // Show notification and refresh UI
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
      const result = await deleteAppointmentWithHistory(appointmentId);

      if (!result.success) {
        handleError("Erro ao excluir agendamento", appointmentId, result.error);
        showDeleteError(`Não foi possível excluir o agendamento: ${result.error?.message || "Erro desconhecido"}`);
        return false;
      }

      logAppointmentAction("Exclusão bem-sucedida", appointmentId);
      showDeleteSuccess();

      await forceRefreshAppointments();
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
