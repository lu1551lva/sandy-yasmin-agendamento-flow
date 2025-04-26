
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const useRescheduleAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkAvailability = async (professionalId: string, date: string, time: string) => {
    const { data: existingAppointments } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('profissional_id', professionalId)
      .eq('data', date)
      .eq('hora', time)
      .eq('status', 'agendado');

    return existingAppointments?.length === 0;
  };

  const rescheduleAppointment = async (
    appointmentId: string,
    newDate: Date,
    newTime: string,
    professionalId: string
  ) => {
    try {
      setIsLoading(true);

      const formattedDate = format(newDate, 'yyyy-MM-dd');
      
      // Check if the time slot is available
      const isAvailable = await checkAvailability(professionalId, formattedDate, newTime);
      
      if (!isAvailable) {
        toast({
          title: "Horário indisponível",
          description: "Este horário já está ocupado. Por favor, selecione outro.",
          variant: "destructive",
        });
        return false;
      }

      // Update the appointment
      const { error } = await supabase
        .from('agendamentos')
        .update({
          data: formattedDate,
          hora: newTime,
        })
        .eq('id', appointmentId);

      if (error) throw error;

      // Invalidate and refetch relevant queries
      await queryClient.invalidateQueries({ queryKey: ['dashboard-appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['weekly-appointments'] });

      toast({
        title: "Agendamento reagendado",
        description: "O horário foi atualizado com sucesso!",
      });

      return true;
    } catch (error) {
      toast({
        title: "Erro ao reagendar",
        description: "Não foi possível reagendar o horário. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rescheduleAppointment,
    isLoading,
  };
};
