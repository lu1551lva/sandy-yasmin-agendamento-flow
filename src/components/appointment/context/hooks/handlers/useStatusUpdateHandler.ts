
import { useCallback } from "react";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useToast } from "@/hooks/use-toast";
import { logAppointmentAction, logAppointmentError } from "@/utils/debugUtils";
import { useAppointmentNotifications } from "@/hooks/appointment/useAppointmentNotifications";

interface UseStatusUpdateHandlerProps {
  appointmentToUpdate: { id: string; status: AppointmentStatus } | null;
  validateAppointmentExists: (id: string | null) => boolean;
  closeStatusUpdateDialog: () => void;
  handleAppointmentUpdated: () => void;
}

export function useStatusUpdateHandler({
  appointmentToUpdate,
  validateAppointmentExists,
  closeStatusUpdateDialog,
  handleAppointmentUpdated
}: UseStatusUpdateHandlerProps) {
  const { toast } = useToast();
  const { updateStatus } = useUpdateAppointmentStatus();
  const { showStatusUpdateSuccess, showStatusUpdateError } = useAppointmentNotifications();

  const handleStatusUpdate = useCallback(async (): Promise<boolean> => {
    if (!appointmentToUpdate || !validateAppointmentExists(appointmentToUpdate.id)) {
      logAppointmentError('Tentativa de atualizar status sem ID válido', appointmentToUpdate?.id || 'null');
      toast({
        title: 'Erro na operação',
        description: 'ID de agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    logAppointmentAction('Atualizando status', appointmentToUpdate.id, {
      status: appointmentToUpdate.status
    });

    try {
      // Ensure we're passing the correctly typed status
      const success = await updateStatus(appointmentToUpdate.id, appointmentToUpdate.status);
      
      if (success) {
        showStatusUpdateSuccess(appointmentToUpdate.status);
        closeStatusUpdateDialog();
        handleAppointmentUpdated();
        return true;
      } else {
        showStatusUpdateError('Não foi possível atualizar o status. Tente novamente.');
        return false;
      }
    } catch (error) {
      logAppointmentError('Erro ao atualizar status', appointmentToUpdate.id, error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante a atualização. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  }, [appointmentToUpdate, validateAppointmentExists, updateStatus, showStatusUpdateSuccess, showStatusUpdateError, toast, closeStatusUpdateDialog, handleAppointmentUpdated]);

  return {
    handleStatusUpdate
  };
}
