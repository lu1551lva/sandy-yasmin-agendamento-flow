
import { useUpdateAppointmentStatus } from './useUpdateAppointmentStatus';
import { AppointmentStatus } from '@/types/appointment.types';
import { useToast } from '@/hooks/use-toast';

export const useAppointmentStatusUpdate = () => {
  const { updateStatus, deleteAppointment, isLoading } = useUpdateAppointmentStatus();
  const { toast } = useToast();

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus, reason?: string) => {
    console.log(`Iniciando atualização do agendamento ${appointmentId} para status ${newStatus}${reason ? ' com motivo: ' + reason : ''}`);
    
    try {
      // Delegate to the main hook and log the result
      const result = await updateStatus(appointmentId, newStatus, reason);
      
      if (result) {
        console.log(`Atualização do agendamento ${appointmentId} para status ${newStatus} concluída com sucesso`);
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
