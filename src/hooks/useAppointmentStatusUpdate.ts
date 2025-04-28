
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';

export const useAppointmentStatusUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      setIsLoading(true);

      // Optimistically update the UI
      queryClient.setQueryData(['appointments'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((appointment: any) => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus }
            : appointment
        );
      });

      // Update the appointment status
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      // Show success toast
      toast({
        title: newStatus === 'concluido' ? 'Agendamento concluído' : 'Agendamento cancelado',
        description: newStatus === 'concluido' 
          ? 'O agendamento foi marcado como concluído com sucesso.'
          : 'O agendamento foi cancelado com sucesso.',
      });

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-appointments'] });

      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateStatus,
    isLoading,
  };
};
