
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';

/**
 * Hook for managing user notifications related to appointment operations
 */
export const useAppointmentNotifications = () => {
  const { toast } = useToast();

  /**
   * Shows a success toast for status updates
   */
  const showStatusUpdateSuccess = (status: AppointmentStatus) => {
    toast({
      title: status === 'concluido' ? 'Agendamento concluído' : 'Agendamento cancelado',
      description: status === 'concluido'
        ? 'O agendamento foi marcado como concluído com sucesso.'
        : 'O agendamento foi cancelado com sucesso.',
    });
  };

  /**
   * Shows an error toast for status updates
   */
  const showStatusUpdateError = (message: string) => {
    toast({
      title: "Erro ao atualizar status",
      description: message,
      variant: "destructive",
    });
  };

  /**
   * Shows a success toast for appointment deletion
   */
  const showDeleteSuccess = () => {
    toast({
      title: "Agendamento excluído",
      description: "O agendamento foi excluído permanentemente.",
    });
  };

  /**
   * Shows an error toast for appointment deletion
   */
  const showDeleteError = (message: string) => {
    toast({
      title: "Erro ao excluir",
      description: message,
      variant: "destructive",
    });
  };

  /**
   * Shows a success toast for appointment rescheduling
   */
  const showRescheduleSuccess = () => {
    toast({
      title: "Agendamento reagendado",
      description: "O horário foi atualizado com sucesso!",
    });
  };

  /**
   * Shows an error toast for appointment rescheduling
   */
  const showRescheduleError = (message: string) => {
    toast({
      title: "Erro ao reagendar",
      description: message,
      variant: "destructive",
    });
  };

  /**
   * Shows a warning toast when history update fails but status update succeeds
   */
  const showHistoryWarning = () => {
    toast({
      title: "Aviso",
      description: "Status atualizado, mas houve um problema ao registrar o histórico.",
      variant: "default",
    });
  };

  /**
   * Shows an error toast for cache invalidation failures
   */
  const showCacheError = () => {
    toast({
      title: "Erro ao atualizar dados",
      description: "Não foi possível atualizar os dados na tela. Tente recarregar a página.",
      variant: "destructive",
    });
  };

  return {
    showStatusUpdateSuccess,
    showStatusUpdateError,
    showDeleteSuccess,
    showDeleteError,
    showRescheduleSuccess,
    showRescheduleError,
    showHistoryWarning,
    showCacheError
  };
};
