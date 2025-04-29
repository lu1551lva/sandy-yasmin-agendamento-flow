import { useState } from "react";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useToast } from "@/hooks/use-toast";
import { 
  logAppointmentAction, 
  logAppointmentError,
  traceAppointmentFlow,
  logStackTrace,
  logUIEvent,
  validateAppointmentId
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
    setCancelReason("");
    // Keep the appointment ID valid until dialog is fully closed
    setTimeout(() => {
      if (!isLoading) {
        setAppointmentToCancel(null);
      }
    }, 300);
  };

  /**
   * Handles the cancellation of the current appointment
   */
  const handleCancel = async () => {
    logStackTrace("handleCancel chamado");
    
    // Immediately check if ID is valid to prevent errors
    if (!appointmentToCancel || !validateAppointmentId(appointmentToCancel)) {
      logAppointmentError("Nenhum ID válido para cancelamento", "null", { appointmentToCancel });
      toast({
        title: "Erro na operação",
        description: "ID de agendamento inválido. Por favor, tente novamente.",
        variant: "destructive",
      });
      closeCancelDialog();
      return false;
    }

    // Store the current ID to use throughout this function
    const currentAppointmentId = appointmentToCancel;

    // Log more details about the appointment to cancel
    logAppointmentAction("Detalhes do agendamento a cancelar", currentAppointmentId, { 
      currentAppointmentId, 
      cancelReason 
    });

    const reasonToUse = cancelReason || "Cancelamento sem motivo especificado";
    traceAppointmentFlow("Iniciando cancelamento", currentAppointmentId, { motivo: reasonToUse });

    try {
      logAppointmentAction("Chamando updateStatus para cancelamento", currentAppointmentId, { 
        status: "cancelado",
        motivo: reasonToUse,
        params: [currentAppointmentId, "cancelado", reasonToUse]
      });

      const success = await updateStatus(currentAppointmentId, "cancelado", reasonToUse);
      
      if (success) {
        logAppointmentAction("Cancelamento bem-sucedido", currentAppointmentId, { motivo: reasonToUse });
        setIsCancelDialogOpen(false);
        setCancelReason("");
        
        // Call the update callback before cleaning up state
        logUIEvent("Chamando onAppointmentUpdated após cancelamento bem-sucedido");
        onAppointmentUpdated();
        
        toast({
          title: "Agendamento cancelado",
          description: "O agendamento foi cancelado com sucesso.",
        });
        
        // Delay clearing the ID to prevent UI issues
        setTimeout(() => {
          if (!isLoading) {
            setAppointmentToCancel(null);
          }
        }, 300);
        
        return true;
      } else {
        logAppointmentError("Falha no cancelamento", currentAppointmentId);
        toast({
          title: "Falha na operação",
          description: "Não foi possível cancelar o agendamento. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      logAppointmentError("Erro inesperado no cancelamento", currentAppointmentId, error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      // Make sure not to clear state while still loading
      if (!isLoading) {
        closeCancelDialog();
      }
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
