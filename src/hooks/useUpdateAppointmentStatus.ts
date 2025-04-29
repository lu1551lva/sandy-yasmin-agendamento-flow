
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';
import { logAppointmentAction, logAppointmentError, traceAppointmentFlow } from '@/utils/debugUtils';
import { useAppointmentCache } from './appointment/useAppointmentCache';

export const useUpdateAppointmentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { invalidateAppointmentQueries } = useAppointmentCache();

  // Direct invalidation of all appointment queries to ensure UI updates
  const forceRefreshAppointments = async () => {
    try {
      await invalidateAppointmentQueries();
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

      const updateData: any = { status };
      if (reason && status === "cancelado") {
        updateData["motivo_cancelamento"] = reason;
      }

      // Atualizar o agendamento
      const { error: updateError } = await supabase
        .from("agendamentos")
        .update(updateData)
        .eq("id", appointmentId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Criar registro de histórico
      const { error: historyError } = await supabase
        .from("agendamento_historico")
        .insert({
          agendamento_id: appointmentId,
          tipo: status,
          descricao: `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`,
          novo_valor: status,
        });

      if (historyError) {
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

      // Primeiro, salvar o histórico
      await supabase
        .from("agendamento_historico")
        .insert({
          agendamento_id: appointmentId,
          tipo: "excluido",
          descricao: "Agendamento excluído permanentemente",
          novo_valor: "excluido"
        });

      // Excluir o agendamento
      const { error: deleteError } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id", appointmentId);

      if (deleteError) {
        throw new Error(deleteError.message);
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
