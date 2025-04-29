
import { useState } from "react";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useToast } from "@/hooks/use-toast";
import { 
  logAppointmentAction, 
  logAppointmentError,
  traceAppointmentFlow,
  logStackTrace,
  logUIEvent
} from "@/utils/debugUtils";

/**
 * Hook for managing appointment cancellation dialog state and actions
 */
export function useCancelDialogState(onAppointmentUpdated: () => void) {
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  const { toast } = useToast();
  const { updateStatus, isLoading } = useUpdateAppointmentStatus();

  /**
   * Opens the cancel dialog for an appointment
   */
  const openCancelDialog = (appointmentId: string) => {
    if (!appointmentId) {
      console.error("Tentativa de abrir diálogo de cancelamento com ID vazio");
      return;
    }
    
    logUIEvent("Opening cancel dialog", appointmentId);
    setAppointmentToCancel(appointmentId);
    setIsCancelDialogOpen(true);
  };

  /**
   * Closes the cancel dialog
   */
  const closeCancelDialog = () => {
    logUIEvent("Closing cancel dialog");
    setIsCancelDialogOpen(false);
    setAppointmentToCancel(null);
    setCancelReason("");
  };

  /**
   * Handles the cancellation of the current appointment
   */
  const handleCancel = async () => {
    logStackTrace("handleCancel chamado");
    
    if (!appointmentToCancel) {
      logAppointmentError("Nenhum ID para cancelamento", "null", { appointmentToCancel });
      toast({
        title: "Erro na operação",
        description: "ID de agendamento inválido. Por favor, tente novamente.",
        variant: "destructive",
      });
      closeCancelDialog();
      return;
    }

    // Log more details about the appointment to cancel
    logAppointmentAction("Detalhes do agendamento a cancelar", appointmentToCancel, { 
      appointmentToCancel, 
      cancelReason 
    });

    const reasonToUse = cancelReason || "Cancelamento sem motivo especificado";
    traceAppointmentFlow("Iniciando cancelamento", appointmentToCancel, { motivo: reasonToUse });

    try {
      logAppointmentAction("Chamando updateStatus para cancelamento", appointmentToCancel, { 
        status: "cancelado",
        motivo: reasonToUse,
        params: [appointmentToCancel, "cancelado", reasonToUse]
      });

      const success = await updateStatus(appointmentToCancel, "cancelado", reasonToUse);
      
      if (success) {
        logAppointmentAction("Cancelamento bem-sucedido", appointmentToCancel, { motivo: reasonToUse });
        setIsCancelDialogOpen(false);
        setAppointmentToCancel(null);
        setCancelReason("");
        logUIEvent("Chamando onAppointmentUpdated após cancelamento bem-sucedido");
        onAppointmentUpdated();
        toast({
          title: "Agendamento cancelado",
          description: "O agendamento foi cancelado com sucesso.",
        });
      } else {
        logAppointmentError("Falha no cancelamento", appointmentToCancel);
        toast({
          title: "Falha na operação",
          description: "Não foi possível cancelar o agendamento. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logAppointmentError("Erro inesperado no cancelamento", appointmentToCancel, error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    appointmentToCancel,
    setAppointmentToCancel,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    cancelReason,
    setCancelReason,
    isLoading,
    openCancelDialog,
    closeCancelDialog,
    handleCancel
  };
}
