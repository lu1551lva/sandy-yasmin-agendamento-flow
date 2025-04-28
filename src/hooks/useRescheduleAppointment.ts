
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const useRescheduleAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateAppointmentQueries = async () => {
    console.log('Invalidating and refetching appointment queries after reschedule...');
    
    try {
      // Invalidate all appointment-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard-appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['weekly-appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] })
      ]);
      
      // Force a refetch of appointments query to update UI immediately
      await queryClient.refetchQueries({ queryKey: ['appointments'] });
      
      console.log('Successfully invalidated and refetched appointment queries');
      
      // Add a small delay to ensure the UI has time to update
      return new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error invalidating queries:', error);
      throw error;
    }
  };

  const checkAvailability = async (professionalId: string, date: string, time: string) => {
    console.log(`Verificando disponibilidade para ${date} às ${time} com profissional ${professionalId}`);
    
    try {
      const { data: existingAppointments, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('profissional_id', professionalId)
        .eq('data', date)
        .eq('hora', time)
        .eq('status', 'agendado');
        
      if (error) {
        console.error("Erro ao verificar disponibilidade:", error);
        return false;
      }

      const isAvailable = existingAppointments?.length === 0;
      console.log(`Horário ${isAvailable ? 'disponível' : 'indisponível'}`);
      
      return isAvailable;
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error);
      return false;
    }
  };

  const rescheduleAppointment = async (
    appointmentId: string,
    newDate: Date,
    newTime: string,
    professionalId: string
  ) => {
    try {
      console.log(`Iniciando reagendamento do agendamento ${appointmentId}`);
      setIsLoading(true);

      const formattedDate = format(newDate, 'yyyy-MM-dd');
      
      // Check if the time slot is available
      const isAvailable = await checkAvailability(professionalId, formattedDate, newTime);
      
      if (!isAvailable) {
        console.error("Horário indisponível");
        toast({
          title: "Horário indisponível",
          description: "Este horário já está ocupado. Por favor, selecione outro.",
          variant: "destructive",
        });
        return false;
      }

      // Get the original appointment data for history
      const { data: originalAppointment, error: fetchError } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('id', appointmentId)
        .single();
        
      if (fetchError) {
        console.error("Erro ao buscar agendamento original:", fetchError);
        throw fetchError;
      }
      
      console.log("Dados do agendamento original:", originalAppointment);

      // Update the appointment
      console.log(`Atualizando agendamento para ${formattedDate} às ${newTime}`);
      const { data: updatedAppointment, error } = await supabase
        .from('agendamentos')
        .update({
          data: formattedDate,
          hora: newTime,
        })
        .eq('id', appointmentId)
        .select();

      if (error) {
        console.error("Erro ao atualizar agendamento:", error);
        throw error;
      }
      
      console.log("Agendamento atualizado com sucesso:", updatedAppointment);

      // Invalidate and refetch relevant queries to update UI
      await invalidateAppointmentQueries();
      
      // Also invalidate specific appointment history
      await queryClient.invalidateQueries({ queryKey: ['appointment-history', appointmentId] });

      toast({
        title: "Agendamento reagendado",
        description: "O horário foi atualizado com sucesso!",
      });

      return true;
    } catch (error) {
      console.error("Erro no reagendamento:", error);
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
