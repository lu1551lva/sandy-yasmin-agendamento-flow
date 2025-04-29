
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';
import { logAppointmentAction, logAppointmentError, traceAppointmentFlow } from '@/utils/debugUtils';

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
      // Invalidate all appointment-related queries
      const queries = [
        'appointments',
        'dashboard-appointments',
        'weekly-appointments',
        'week-appointments' // Also invalidate weekly view
      ];
      
      // Invalidate all queries in parallel
      await Promise.all(
        queries.map(query => queryClient.invalidateQueries({ queryKey: [query] }))
      );
      
      // Force immediate refetch of the main appointments query to garantir a atualização da interface
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
   * @param appointmentId ID do agendamento
   * @param status Novo status
   * @param reason Motivo (opcional, para cancelamentos)
   */
  const updateStatus = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    try {
      // Validar o ID do agendamento primeiro
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

      // STEP 1: Montar os dados para atualização
      const updateData: Record<string, any> = { status };
      
      // Adicionar motivo de cancelamento se fornecido e for um cancelamento
      if (reason && status === 'cancelado') {
        updateData['motivo_cancelamento'] = reason;
        logAppointmentAction(`Adicionando motivo`, appointmentId, { motivo: reason });
      }

      logAppointmentAction('Preparando update', appointmentId, { updateData });
      
      // STEP 2: Executar a atualização no Supabase com logs detalhados
      const { data: appointmentData, error: updateError } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', appointmentId)
        .select();

      // Log do resultado da operação de atualização
      if (updateError) {
        logAppointmentError("Erro do Supabase na atualização", appointmentId, updateError);
        toast({
          title: "Erro ao atualizar status",
          description: `Não foi possível atualizar o status do agendamento: ${updateError.message}`,
          variant: "destructive",
        });
        return false;
      }
      
      // Verificar se o update realmente fez alterações
      if (!appointmentData || appointmentData.length === 0) {
        logAppointmentError("Nenhum dado retornado do update", appointmentId, { status });
        toast({
          title: "Erro ao atualizar status",
          description: "O agendamento não foi encontrado ou não pôde ser atualizado.",
          variant: "destructive",
        });
        return false;
      }
      
      logAppointmentAction("Update realizado com sucesso", appointmentId, { 
        novoDados: appointmentData,
        novoStatus: status
      });

      // STEP 3: Criar entrada no histórico após atualização bem-sucedida
      const historyEntry = {
        agendamento_id: appointmentId,
        tipo: status,
        descricao: `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`,
        novo_valor: status,
      };
      
      logAppointmentAction("Inserindo histórico", appointmentId, historyEntry);
      
      const { error: historyError } = await supabase
        .from('agendamento_historico')
        .insert(historyEntry);

      if (historyError) {
        logAppointmentError("Erro ao registrar histórico", appointmentId, historyError);
        // Still show success toast since the main update succeeded
        toast({
          title: "Aviso",
          description: "Status atualizado, mas houve um problema ao registrar o histórico.",
          variant: "default",
        });
      } else {
        logAppointmentAction("Histórico registrado", appointmentId);
      }

      // Show success toast
      toast({
        title: status === 'concluido' ? 'Agendamento concluído' : 'Agendamento cancelado',
        description: status === 'concluido' 
          ? 'O agendamento foi marcado como concluído com sucesso.'
          : 'O agendamento foi cancelado com sucesso.',
      });

      // STEP 4: Atualizar a interface invalidando e recarregando os dados
      logAppointmentAction("Atualizando interface", appointmentId);
      await invalidateAppointmentQueries();
      
      // Additionally invalidate the specific appointment history query
      await queryClient.invalidateQueries({ queryKey: ['appointment-history', appointmentId] });

      return true;
    } catch (error) {
      logAppointmentError("Erro geral na atualização", appointmentId || 'unknown', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do agendamento. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exclui um agendamento e seu histórico
   * @param appointmentId ID do agendamento a ser excluído
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

      // Delete appointment history first
      const { error: historyDeleteError } = await supabase
        .from('agendamento_historico')
        .delete()
        .eq('agendamento_id', appointmentId);

      if (historyDeleteError) {
        logAppointmentError("Erro ao excluir histórico", appointmentId, historyDeleteError);
        toast({
          title: "Erro ao excluir histórico",
          description: `Erro ao excluir histórico: ${historyDeleteError.message}`,
          variant: "destructive",
        });
        // Continue with deletion even if history deletion fails
      }

      // Then delete the appointment itself
      const { error: appointmentDeleteError } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', appointmentId);

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

      // Invalidate and reload relevant queries
      logAppointmentAction("Atualizando interface após exclusão", appointmentId);
      await invalidateAppointmentQueries();

      return true;
    } catch (error) {
      logAppointmentError("Erro geral na exclusão", appointmentId || 'unknown', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o agendamento. Tente novamente.",
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
