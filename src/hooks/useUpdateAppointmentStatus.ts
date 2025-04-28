
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';

export const useUpdateAppointmentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatus = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      setIsLoading(true);

      // Update the appointment status
      const { error } = await supabase
        .from('agendamentos')
        .update({ status })
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
      await supabase
        .from('agendamento_historico')
        .insert({
          agendamento_id: appointmentId,
          tipo: status,
          descricao: `Status alterado para ${status}`,
          novo_valor: status,
        });

      // Invalidate and refetch relevant queries
      await queryClient.invalidateQueries({ queryKey: ['dashboard-appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['weekly-appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
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

      // Then delete the appointment
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

      // Invalidate and refetch relevant queries
      await queryClient.invalidateQueries({ queryKey: ['dashboard-appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['weekly-appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });

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
