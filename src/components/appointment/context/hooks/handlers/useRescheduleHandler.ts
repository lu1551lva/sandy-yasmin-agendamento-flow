
import { useCallback } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";
import { useToast } from "@/hooks/use-toast";
import { logAppointmentAction, logAppointmentError } from "@/utils/debugUtils";

interface UseRescheduleHandlerProps {
  selectedAppointment: AppointmentWithDetails | null;
  validateAppointmentExists: (id: string | null) => boolean;
  closeRescheduleDialog: () => void;
  handleAppointmentUpdated: () => void;
}

export function useRescheduleHandler({
  selectedAppointment,
  validateAppointmentExists,
  closeRescheduleDialog,
  handleAppointmentUpdated
}: UseRescheduleHandlerProps) {
  const { toast } = useToast();
  const { rescheduleAppointment, isLoading: isReschedulingLoading } = useRescheduleAppointment();

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
    handleReschedule,
    isReschedulingLoading
  };
}
