
import { CancelAppointmentDialog } from "@/components/appointment/CancelAppointmentDialog";

interface AppointmentCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
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
  // Validar que temos um appointmentId válido
  const handleConfirm = (cancelReason: string) => {
    if (!appointmentId) {
      console.error('Nenhum agendamento selecionado para cancelamento', {appointmentId});
      return;
    }
    
    console.log(`Confirmando cancelamento para agendamento ${appointmentId} com motivo: ${cancelReason}`);
    onConfirm();
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
