
import { useState } from "react";
import { AppointmentStatus } from "@/types/appointment.types";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useToast } from "@/hooks/use-toast";
import { 
  logAppointmentAction, 
  logAppointmentError,
  traceAppointmentFlow,
  logUIEvent,
  validateAppointmentId
} from "@/utils/debugUtils";

/**
 * Hook for managing appointment status update state and actions
 */
export function useStatusUpdateState(onAppointmentUpdated: () => void) {
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{ id: string; status: AppointmentStatus } | null>(null);
  const { toast } = useToast();
  const { updateStatus, isLoading } = useUpdateAppointmentStatus();

  /**
   * Updates the status of the current appointment
   */
  const handleUpdateStatus = async () => {
    logUIEvent("Status update initiated");
    
    if (!appointmentToUpdate) {
      logAppointmentError("Nenhum agendamento selecionado para atualização", "undefined");
      toast({
        title: "Erro na operação",
        description: "ID de agendamento inválido. Por favor, tente novamente.",
        variant: "destructive",
      });
      return false;
    }

    if (!validateAppointmentId(appointmentToUpdate.id)) {
      logAppointmentError("ID de agendamento inválido", appointmentToUpdate.id || "undefined");
      toast({
        title: "Erro na operação",
        description: "ID de agendamento inválido. Por favor, tente novamente.",
        variant: "destructive",
      });
      return false;
    }

    traceAppointmentFlow("Iniciando atualização", appointmentToUpdate.id, appointmentToUpdate.status);

    try {
      logAppointmentAction("Chamando updateStatus", appointmentToUpdate.id, { 
        status: appointmentToUpdate.status,
        params: [appointmentToUpdate.id, appointmentToUpdate.status]
      });

      const success = await updateStatus(appointmentToUpdate.id, appointmentToUpdate.status);
      
      if (success) {
        logAppointmentAction("Atualização bem-sucedida", appointmentToUpdate.id, appointmentToUpdate.status);
        setAppointmentToUpdate(null);
        logUIEvent("Chamando onAppointmentUpdated após atualização bem-sucedida");
        onAppointmentUpdated();
        toast({
          title: appointmentToUpdate.status === 'concluido' ? 'Agendamento concluído' : 'Status atualizado',
          description: appointmentToUpdate.status === 'concluido'
            ? 'O agendamento foi marcado como concluído com sucesso.'
            : 'O status do agendamento foi atualizado com sucesso.',
        });
        return true;
      } else {
        logAppointmentError("Falha na atualização", appointmentToUpdate.id);
        toast({
          title: "Falha na operação",
          description: "Não foi possível atualizar o status do agendamento. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      logAppointmentError("Erro inesperado na atualização", appointmentToUpdate.id, error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    appointmentToUpdate,
    setAppointmentToUpdate,
    isLoading,
    handleUpdateStatus
  };
}
