
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
  // Only call onConfirm if we have a valid appointmentId
  const handleConfirm = () => {
    if (!appointmentId) {
      console.error('Nenhum agendamento selecionado para cancelamento', {appointmentId});
      return;
    }
    
    console.log(`Confirmando cancelamento para agendamento ${appointmentId}`);
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
