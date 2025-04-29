
import { CancelAppointmentDialog } from "@/components/appointment/CancelAppointmentDialog";
import { logAppointmentAction, logAppointmentError, validateAppointmentId } from "@/utils/debugUtils";

interface AppointmentCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
  appointmentId?: string | null;
}

export function AppointmentCancelDialog({
  isOpen,
  onClose,
  reason,
  onReasonChange,
  onConfirm,
  isLoading,
  appointmentId
}: AppointmentCancelDialogProps) {
  const handleConfirm = (cancelReason: string) => {
    // Debug log to check if appointmentId exists
    logAppointmentAction('Confirmando cancelamento em AppointmentCancelDialog', appointmentId || 'null', { motivo: cancelReason });
    
    if (!validateAppointmentId(appointmentId)) {
      logAppointmentError('Nenhum agendamento selecionado para cancelamento em AppointmentCancelDialog', appointmentId || 'null');
      return;
    }
    
    // Passing the reason to onConfirm
    onConfirm(cancelReason);
  };

  return (
    <CancelAppointmentDialog
      isOpen={isOpen}
      onClose={onClose}
      reason={reason}
      onReasonChange={onReasonChange}
      onConfirm={handleConfirm}
      isLoading={isLoading}
    />
  );
}
