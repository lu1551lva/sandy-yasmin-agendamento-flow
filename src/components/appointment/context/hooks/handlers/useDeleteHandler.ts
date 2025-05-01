
import { useCallback } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useToast } from "@/hooks/use-toast";
import { logAppointmentAction, logAppointmentError } from "@/utils/debugUtils";

interface UseDeleteHandlerProps {
  selectedAppointment: AppointmentWithDetails | null;
  validateAppointmentExists: (id: string | null) => boolean;
  handleAppointmentUpdated: () => void;
}

export function useDeleteHandler({
  selectedAppointment,
  validateAppointmentExists,
  handleAppointmentUpdated
}: UseDeleteHandlerProps) {
  const { toast } = useToast();
  const { deleteAppointment } = useUpdateAppointmentStatus();

  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!selectedAppointment || !validateAppointmentExists(selectedAppointment.id)) {
      logAppointmentError('Tentativa de excluir sem agendamento válido', selectedAppointment?.id || 'null');
      toast({
        title: 'Erro na operação',
        description: 'ID de agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    logAppointmentAction('Excluindo agendamento permanentemente', selectedAppointment.id);

    try {
      // Use the imported deleteAppointment function from useUpdateAppointmentStatus
      const success = await deleteAppointment(selectedAppointment.id);
      
      if (success) {
        toast({
          title: 'Agendamento excluído',
          description: 'O agendamento foi excluído permanentemente com sucesso.',
        });
        
        handleAppointmentUpdated();
        return true;
      } else {
        toast({
          title: 'Erro na operação',
          description: 'Não foi possível excluir o agendamento. Tente novamente.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      logAppointmentError('Erro ao excluir agendamento', selectedAppointment.id, error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante a exclusão. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  }, [selectedAppointment, validateAppointmentExists, deleteAppointment, toast, handleAppointmentUpdated]);

  return {
    handleDelete
  };
}
