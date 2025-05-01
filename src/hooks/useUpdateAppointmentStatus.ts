
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';
import { logAppointmentAction, logAppointmentError, traceAppointmentFlow } from '@/utils/debugUtils';
import { useAppointmentCache } from './appointment/useAppointmentCache';
import { useAppointmentDatabase } from './appointment/useAppointmentDatabase';

export const useUpdateAppointmentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { invalidateAppointmentQueries } = useAppointmentCache();
  const { 
    updateAppointmentStatus,
    createHistoryEntry,
    deleteAppointmentWithHistory 
  } = useAppointmentDatabase();

  // Direct invalidation of all appointment queries to ensure UI updates
  const forceRefreshAppointments = async () => {
    try {
      console.log("🔄 Forcing refresh of all appointment data...");
      
      // First invalidate all queries that might contain appointment data
      await queryClient.invalidateQueries({ 
        predicate: query => 
          Array.isArray(query.queryKey) && 
          query.queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes('appointment') || key.includes('agendamento'))
          )
      });

      // Then specifically invalidate the ones we know about
      await invalidateAppointmentQueries();
      
      // Force immediate refetch of critical queries
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['appointments'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['weekly-appointments'] })
      ]);
      
      console.log("✅ All appointment data refreshed successfully");
      return true;
    } catch (error) {
      console.error("❌ Erro ao forçar atualização do cache", error);
      return false;
    }
  };

  const updateStatus = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    setIsLoading(true);
    try {
      if (!appointmentId) {
        throw new Error("ID de agendamento inválido");
      }

      traceAppointmentFlow('Atualizando status do agendamento', appointmentId, { status, reason });

      // Use our refactored hook to update the status
      const { success, error } = await updateAppointmentStatus(appointmentId, status, reason);
      
      if (!success) {
        throw new Error(error?.message || "Falha ao atualizar status");
      }

      // Create history entry using our refactored hook
      const historyDescription = `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`;
      const { success: historySuccess, error: historyError } = await createHistoryEntry(
        appointmentId,
        status,
        historyDescription,
        undefined,
        status
      );

      if (!historySuccess) {
        console.warn("⚠️ Erro ao registrar histórico:", historyError);
      }

      // Mostrar notificação de sucesso
      toast({
        title: "Sucesso!",
        description: status === "cancelado" ? "Agendamento cancelado com sucesso." : 
                    status === "concluido" ? "Agendamento concluído com sucesso." : 
                    "Status atualizado com sucesso.",
      });

      // Invalidar caches e forçar atualização
      await forceRefreshAppointments();

      return true;
    } catch (error: any) {
      logAppointmentError('Erro ao atualizar status', appointmentId, error);
      toast({
        title: "Erro ao atualizar agendamento",
        description: error?.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    setIsLoading(true);
    try {
      if (!appointmentId) {
        throw new Error("ID de agendamento inválido");
      }

      logAppointmentAction('Excluindo agendamento', appointmentId);

      // Use our refactored hook to delete the appointment
      const { success, error } = await deleteAppointmentWithHistory(appointmentId);

      if (!success) {
        throw new Error(error?.message || "Falha ao excluir agendamento");
      }

      // Mostrar notificação de sucesso
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso."
      });

      // Invalidar caches e forçar atualização
      await forceRefreshAppointments();

      return true;
    } catch (error: any) {
      logAppointmentError('Erro ao excluir agendamento', appointmentId, error);
      toast({
        title: "Erro ao excluir agendamento",
        description: error?.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
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
