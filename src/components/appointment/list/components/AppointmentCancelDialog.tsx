
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
    if (!validateAppointmentId(appointmentId)) {
      logAppointmentError('Nenhum agendamento selecionado para cancelamento', appointmentId || 'null');
      return;
    }
    
    logAppointmentAction('Confirmando cancelamento', appointmentId!, { motivo: cancelReason });
    
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
