
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';

export const useUpdateAppointmentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateAppointmentQueries = async () => {
    console.log('Invalidando caches de agendamentos...');
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
      
      // Force immediate refetch of the main appointments query
      await queryClient.refetchQueries({ queryKey: ['appointments'] });
      
      console.log('Cache invalidado e dados recarregados com sucesso.');
      return true;
    } catch (error) {
      console.error('Erro ao invalidar cache:', error);
      toast({
        title: "Erro ao atualizar dados",
        description: "Não foi possível atualizar os dados na tela. Tente recarregar a página.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateStatus = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    try {
      if (!appointmentId) {
        const errorMsg = 'ID de agendamento inválido para atualização de status';
        console.error(errorMsg, {appointmentId});
        toast({
          title: "Erro ao atualizar status",
          description: "ID de agendamento inválido. Por favor, tente novamente.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log(`Iniciando atualização do agendamento ${appointmentId} para status ${status}`);
      setIsLoading(true);

      // STEP 1: Update appointment status in the database
      const updateData: Record<string, any> = { status };
      
      // Add cancellation reason if provided
      if (reason && status === 'cancelado') {
        updateData['motivo_cancelamento'] = reason;
        console.log(`Adicionando motivo de cancelamento: "${reason}"`);
      }

      console.log('Dados para atualização:', updateData);
      console.log('ID do agendamento:', appointmentId);
      
      // Perform the update operation with detailed logging
      const { data: appointmentData, error: updateError } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', appointmentId)
        .select();

      // Log the result of the update operation
      if (updateError) {
        console.error("Erro ao atualizar status do agendamento:", updateError);
        toast({
          title: "Erro ao atualizar status",
          description: `Não foi possível atualizar o status do agendamento: ${updateError.message}`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!appointmentData || appointmentData.length === 0) {
        console.error("Agendamento não encontrado ou não atualizado", {appointmentId, status});
        toast({
          title: "Erro ao atualizar status",
          description: "O agendamento não foi encontrado ou não pôde ser atualizado.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log("Agendamento atualizado com sucesso:", appointmentData);
      console.log(`Status alterado para: ${status}`);

      // STEP 2: Create history entry after successful update
      const historyEntry = {
        agendamento_id: appointmentId,
        tipo: status,
        descricao: `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`,
        novo_valor: status,
      };
      
      console.log("Inserindo entrada no histórico:", historyEntry);
      
      const { error: historyError } = await supabase
        .from('agendamento_historico')
        .insert(historyEntry);

      if (historyError) {
        console.error("Erro ao registrar histórico:", historyError);
        // Still show success toast since the main update succeeded
        toast({
          title: "Aviso",
          description: "Status atualizado, mas houve um problema ao registrar o histórico.",
          variant: "default",
        });
      } else {
        console.log("Histórico registrado com sucesso");
      }

      // Show success toast
      toast({
        title: status === 'concluido' ? 'Agendamento concluído' : 'Agendamento cancelado',
        description: status === 'concluido' 
          ? 'O agendamento foi marcado como concluído com sucesso.'
          : 'O agendamento foi cancelado com sucesso.',
      });

      // STEP 3: Invalidate and reload relevant queries
      console.log("Atualizando interface...");
      await invalidateAppointmentQueries();
      
      // Additionally invalidate the specific appointment history query
      await queryClient.invalidateQueries({ queryKey: ['appointment-history', appointmentId] });

      return true;
    } catch (error) {
      console.error("Erro geral na atualização de status:", error);
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

  const deleteAppointment = async (appointmentId: string) => {
    try {
      if (!appointmentId) {
        console.error("ID de agendamento inválido para exclusão");
        toast({
          title: "Erro ao excluir",
          description: "ID de agendamento inválido. Por favor, tente novamente.",
          variant: "destructive",
        });
        return false;
      }
      
      setIsLoading(true);
      console.log(`Iniciando exclusão do agendamento ${appointmentId}`);

      // Delete appointment history first
      const { error: historyDeleteError } = await supabase
        .from('agendamento_historico')
        .delete()
        .eq('agendamento_id', appointmentId);

      if (historyDeleteError) {
        console.error("Erro ao excluir histórico do agendamento:", historyDeleteError);
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
        console.error("Erro ao excluir agendamento:", appointmentDeleteError);
        toast({
          title: "Erro ao excluir",
          description: `Não foi possível excluir o agendamento: ${appointmentDeleteError.message}`,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído permanentemente.",
      });

      // Invalidate and reload relevant queries
      console.log("Atualizando interface após exclusão...");
      await invalidateAppointmentQueries();

      return true;
    } catch (error) {
      console.error("Erro geral na exclusão do agendamento:", error);
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
