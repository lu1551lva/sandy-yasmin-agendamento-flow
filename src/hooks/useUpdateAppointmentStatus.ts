
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';
import { 
  logAppointmentAction, 
  logAppointmentError, 
  traceAppointmentFlow,
  logDatabaseOperation
} from '@/utils/debugUtils';

export const useUpdateAppointmentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Invalida e recarrega todas as queries relacionadas a agendamentos
   */
  const invalidateAppointmentQueries = async () => {
    logAppointmentAction('Invalidando caches', 'all-queries');
    try {
      const queries = [
        'appointments',
        'dashboard-appointments',
        'weekly-appointments',
        'week-appointments'
      ];

      await Promise.all(
        queries.map(query => queryClient.invalidateQueries({ queryKey: [query] }))
      );

      await queryClient.refetchQueries({ queryKey: ['appointments'] });

      logAppointmentAction('Cache invalidado', 'all-queries', 'Dados recarregados com sucesso');
      return true;
    } catch (error) {
      logAppointmentError('Erro ao invalidar cache', 'query-invalidation', error);
      toast({
        title: "Erro ao atualizar dados",
        description: "Não foi possível atualizar os dados na tela. Tente recarregar a página.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Atualiza o status de um agendamento no banco de dados
   */
  const updateStatus = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    try {
      if (!appointmentId || appointmentId.trim() === '') {
        const errorMsg = 'ID de agendamento inválido para atualização de status';
        logAppointmentError(errorMsg, appointmentId || 'null');
        toast({
          title: "Erro ao atualizar status",
          description: "ID de agendamento inválido. Por favor, tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      traceAppointmentFlow(`Iniciando atualização`, appointmentId, { status });
      setIsLoading(true);

      const updateData: Record<string, any> = { status };

      if (reason && status === 'cancelado') {
        updateData['motivo_cancelamento'] = reason;
        logAppointmentAction(`Adicionando motivo`, appointmentId, { motivo: reason });
      }

      logAppointmentAction('Preparando update', appointmentId, { updateData });

      const result = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', appointmentId);
      
      logDatabaseOperation('UPDATE', 'agendamentos', result);
      
      const { error: updateError } = result;

      if (updateError) {
        logAppointmentError("Erro do Supabase na atualização", appointmentId, updateError);
        toast({
          title: "Erro ao atualizar status",
          description: `Não foi possível atualizar o status do agendamento: ${updateError.message}`,
          variant: "destructive",
        });
        return false;
      }

      logAppointmentAction("Update realizado com sucesso", appointmentId, { novoStatus: status });

      const historyEntry = {
        agendamento_id: appointmentId,
        tipo: status,
        descricao: `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`,
        novo_valor: status,
      };

      logAppointmentAction("Inserindo histórico", appointmentId, historyEntry);

      const historyResult = await supabase
        .from('agendamento_historico')
        .insert(historyEntry);
      
      logDatabaseOperation('INSERT', 'agendamento_historico', historyResult);

      const { error: historyError } = historyResult;

      if (historyError) {
        logAppointmentError("Erro ao registrar histórico", appointmentId, historyError);
        toast({
          title: "Aviso",
          description: "Status atualizado, mas houve um problema ao registrar o histórico.",
          variant: "default",
        });
      } else {
        logAppointmentAction("Histórico registrado", appointmentId);
      }

      toast({
        title: status === 'concluido' ? 'Agendamento concluído' : 'Agendamento cancelado',
        description: status === 'concluido'
          ? 'O agendamento foi marcado como concluído com sucesso.'
          : 'O agendamento foi cancelado com sucesso.',
      });

      logAppointmentAction("Atualizando interface", appointmentId);
      await invalidateAppointmentQueries();
      await queryClient.invalidateQueries({ queryKey: ['appointment-history', appointmentId] });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      logAppointmentError("Erro geral na atualização", appointmentId || 'unknown', errorMessage);
      toast({
        title: "Erro ao atualizar status",
        description: `Erro: ${errorMessage}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exclui um agendamento e seu histórico
   */
  const deleteAppointment = async (appointmentId: string) => {
    try {
      if (!appointmentId) {
        logAppointmentError("ID inválido para exclusão", "null");
        toast({
          title: "Erro ao excluir",
          description: "ID de agendamento inválido. Por favor, tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      setIsLoading(true);
      traceAppointmentFlow(`Iniciando exclusão`, appointmentId);

      const historyResult = await supabase
        .from('agendamento_historico')
        .delete()
        .eq('agendamento_id', appointmentId);
      
      logDatabaseOperation('DELETE', 'agendamento_historico', historyResult);

      const { error: historyDeleteError } = historyResult;

      if (historyDeleteError) {
        logAppointmentError("Erro ao excluir histórico", appointmentId, historyDeleteError);
        toast({
          title: "Erro ao excluir histórico",
          description: `Erro ao excluir histórico: ${historyDeleteError.message}`,
          variant: "destructive",
        });
      }

      const appointmentResult = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', appointmentId);
      
      logDatabaseOperation('DELETE', 'agendamentos', appointmentResult);

      const { error: appointmentDeleteError } = appointmentResult;

      if (appointmentDeleteError) {
        logAppointmentError("Erro ao excluir agendamento", appointmentId, appointmentDeleteError);
        toast({
          title: "Erro ao excluir",
          description: `Não foi possível excluir o agendamento: ${appointmentDeleteError.message}`,
          variant: "destructive",
        });
        return false;
      }

      logAppointmentAction("Exclusão bem-sucedida", appointmentId);
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído permanentemente.",
      });

      logAppointmentAction("Atualizando interface após exclusão", appointmentId);
      await invalidateAppointmentQueries();

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      logAppointmentError("Erro geral na exclusão", appointmentId || 'unknown', errorMessage);
      toast({
        title: "Erro ao excluir",
        description: `Erro: ${errorMessage}`,
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
