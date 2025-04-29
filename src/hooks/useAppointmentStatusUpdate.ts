
import { useUpdateAppointmentStatus } from './useUpdateAppointmentStatus';
import { AppointmentStatus } from '@/types/appointment.types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useAppointmentStatusUpdate = () => {
  const { updateStatus: updateAppointmentStatusBase, deleteAppointment, isLoading } = useUpdateAppointmentStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus, reason?: string) => {
    if (!appointmentId) {
      console.error(`ID de agendamento inválido para atualização de status: ${appointmentId}`);
      return false;
    }
    
    console.log(`Iniciando atualização do agendamento ${appointmentId} para status ${newStatus}${reason ? ' com motivo: ' + reason : ''}`);
    
    try {
      // Delegate to the main hook and log the result
      const result = await updateAppointmentStatusBase(appointmentId, newStatus, reason);
      
      if (result) {
        console.log(`Atualização do agendamento ${appointmentId} para status ${newStatus} concluída com sucesso`);
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({queryKey: ['agendamentos']});
        
        return true;
      } else {
        console.error(`Falha na atualização do agendamento ${appointmentId} para status ${newStatus}`);
        return false;
      }
    } catch (error) {
      console.error(`Erro inesperado ao atualizar agendamento ${appointmentId}:`, error);
      toast({
        title: `Erro ao ${newStatus === 'concluido' ? 'concluir' : 'cancelar'} agendamento`,
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    updateStatus: updateAppointmentStatus,
    deleteAppointment,
    isLoading,
  };
};
