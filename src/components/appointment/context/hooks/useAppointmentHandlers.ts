
import { useCallback } from "react";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";
import { useToast } from "@/hooks/use-toast";
import { logAppointmentAction, logAppointmentError, logUIEvent } from "@/utils/debugUtils";
import { useAppointmentCache } from "@/hooks/appointment/useAppointmentCache";
import { useAppointmentNotifications } from "@/hooks/appointment/useAppointmentNotifications";

interface UseAppointmentHandlersProps {
  selectedAppointment: AppointmentWithDetails | null;
  appointmentToUpdate: { id: string; status: AppointmentStatus } | null;
  appointmentToCancel: string | null;
  cancelReason: string;
  validateAppointmentExists: (id: string | null) => boolean;
  closeStatusUpdateDialog: () => void;
  closeCancelDialog: () => void;
  closeRescheduleDialog: () => void;
  onAppointmentUpdated: () => void;
}

export function useAppointmentHandlers({
  selectedAppointment,
  appointmentToUpdate,
  appointmentToCancel,
  cancelReason,
  validateAppointmentExists,
  closeStatusUpdateDialog,
  closeCancelDialog,
  closeRescheduleDialog,
  onAppointmentUpdated
}: UseAppointmentHandlersProps) {
  const { toast } = useToast();
  const { updateStatus, deleteAppointment, isLoading } = useUpdateAppointmentStatus();
  const { rescheduleAppointment, isLoading: isReschedulingLoading } = useRescheduleAppointment();
  const { invalidateAppointmentQueries } = useAppointmentCache();
  const { showStatusUpdateSuccess, showStatusUpdateError } = useAppointmentNotifications();

  // Helper function to handle when an appointment is updated
  const handleAppointmentUpdated = useCallback(() => {
    logUIEvent('Appointment updated, refreshing data...');
    invalidateAppointmentQueries().then(() => {
      onAppointmentUpdated();
    });
  }, [onAppointmentUpdated, invalidateAppointmentQueries]);

  // Action handlers
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

  const handleCancel = useCallback(async (): Promise<boolean> => {
    if (!appointmentToCancel || !validateAppointmentExists(appointmentToCancel)) {
      logAppointmentError('Tentativa de cancelar sem ID válido', appointmentToCancel || 'null');
      toast({
        title: 'Erro na operação',
        description: 'ID de agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    const reasonToUse = cancelReason || 'Cancelamento sem motivo especificado';
    logAppointmentAction('Cancelando agendamento', appointmentToCancel, {
      motivo: reasonToUse
    });

    try {
      const success = await updateStatus(appointmentToCancel, 'cancelado', reasonToUse);
      
      if (success) {
        toast({
          title: 'Agendamento cancelado',
          description: 'O agendamento foi cancelado com sucesso.',
        });
        
        closeCancelDialog();
        handleAppointmentUpdated();
        return true;
      } else {
        toast({
          title: 'Erro na operação',
          description: 'Não foi possível cancelar o agendamento. Tente novamente.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      logAppointmentError('Erro ao cancelar agendamento', appointmentToCancel, error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante o cancelamento. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  }, [appointmentToCancel, cancelReason, validateAppointmentExists, updateStatus, toast, closeCancelDialog, handleAppointmentUpdated]);

  const handleReschedule = useCallback(async (date: Date, time: string): Promise<boolean> => {
    if (!selectedAppointment || !validateAppointmentExists(selectedAppointment.id)) {
      logAppointmentError('Tentativa de reagendar sem agendamento válido', selectedAppointment?.id || 'null');
      toast({
        title: 'Erro na operação',
        description: 'Agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    logAppointmentAction('Reagendando', selectedAppointment.id, { date, time });

    try {
      const success = await rescheduleAppointment(
        selectedAppointment.id,
        date,
        time,
        selectedAppointment.profissional.id
      );
      
      if (success) {
        toast({
          title: 'Agendamento reagendado',
          description: 'O agendamento foi reagendado com sucesso.',
        });
        
        closeRescheduleDialog();
        handleAppointmentUpdated();
        return true;
      } else {
        toast({
          title: 'Erro na operação',
          description: 'Não foi possível reagendar o agendamento. Tente novamente.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      logAppointmentError('Erro ao reagendar agendamento', selectedAppointment.id, error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante o reagendamento. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  }, [selectedAppointment, validateAppointmentExists, rescheduleAppointment, toast, closeRescheduleDialog, handleAppointmentUpdated]);

  return {
    isLoading,
    isReschedulingLoading,
    handleStatusUpdate,
    handleCancel,
    handleReschedule,
    handleAppointmentUpdated
  };
}
