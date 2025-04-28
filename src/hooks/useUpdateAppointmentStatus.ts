
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
    console.log('Invalidating appointment queries...');
    // Invalidate all appointment-related queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard-appointments'] }),
      queryClient.invalidateQueries({ queryKey: ['weekly-appointments'] })
    ]);
    
    // Force a refetch of appointments query to update UI immediately
    await queryClient.refetchQueries({ queryKey: ['appointments'] });
    
    // Add a small delay to ensure the UI has time to update
    return new Promise(resolve => setTimeout(resolve, 100));
  };

  const updateStatus = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    try {
      setIsLoading(true);

      // Update appointment status in the database
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

      // Create history entry
      const historyEntry = {
        agendamento_id: appointmentId,
        tipo: status,
        descricao: `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`,
        novo_valor: status,
      };
      
      await supabase.from('agendamento_historico').insert(historyEntry);

      // Show success toast
      toast({
        title: status === 'concluido' ? 'Agendamento concluído' : 'Agendamento cancelado',
        description: status === 'concluido' 
          ? 'O agendamento foi marcado como concluído com sucesso.'
          : 'O agendamento foi cancelado com sucesso.',
      });

      // Invalidate and reload relevant queries
      await invalidateAppointmentQueries();
      
      // Additionally invalidate the specific appointment history query
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

      // Delete appointment history first
      await supabase
        .from('agendamento_historico')
        .delete()
        .eq('agendamento_id', appointmentId);

      // Then delete the appointment itself
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

      // Invalidate and reload relevant queries
      await invalidateAppointmentQueries();

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
