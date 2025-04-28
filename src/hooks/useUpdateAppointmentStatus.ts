
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';

export const useUpdateAppointmentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatus = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    try {
      setIsLoading(true);

      // Atualizar status do agendamento no banco
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          status,
          ...(reason ? { motivo_cancelamento: reason } : {})
        })
        .eq('id', appointmentId);

      if (error) {
        console.error("Erro ao atualizar status:", error);
        toast({
          title: "Erro ao atualizar status",
          description: "Não foi possível atualizar o status do agendamento.",
          variant: "destructive",
        });
        return false;
      }

      // Criar entrada no histórico
      const historyEntry = {
        agendamento_id: appointmentId,
        tipo: status,
        descricao: `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`,
        novo_valor: status,
      };
      
      await supabase.from('agendamento_historico').insert(historyEntry);

      // Mostrar toast de sucesso
      toast({
        title: status === 'concluido' ? 'Agendamento concluído' : 'Agendamento cancelado',
        description: status === 'concluido' 
          ? 'O agendamento foi marcado como concluído com sucesso.'
          : 'O agendamento foi cancelado com sucesso.',
      });

      // Invalidar e recarregar as queries relevantes
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['weekly-appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['appointment-history', appointmentId] });

      return true;
    } catch (error) {
      console.error("Erro na atualização de status:", error);
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
      setIsLoading(true);

      // Excluir o histórico do agendamento primeiro
      await supabase
        .from('agendamento_historico')
        .delete()
        .eq('agendamento_id', appointmentId);

      // Em seguida, excluir o agendamento
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        console.error("Erro ao excluir agendamento:", error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o agendamento.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído permanentemente.",
      });

      // Invalidar e recarregar as queries relevantes
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['weekly-appointments'] });

      return true;
    } catch (error) {
      console.error("Erro na exclusão do agendamento:", error);
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
