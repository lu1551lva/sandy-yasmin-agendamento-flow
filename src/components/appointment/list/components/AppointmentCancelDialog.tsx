
import { CancelAppointmentDialog } from "@/components/appointment/CancelAppointmentDialog";

interface AppointmentCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
  appointmentId?: string | null; // Add optional appointmentId prop
}

export function AppointmentCancelDialog({
  isOpen,
  onClose,
  reason,
  onReasonChange,
  onConfirm,
  isLoading,
  appointmentId // Add appointmentId as a prop
}: AppointmentCancelDialogProps) {
  // Validate that we have a valid appointmentId before confirming
  const handleConfirm = () => {
    if (!appointmentId) {
      console.error('Nenhum agendamento selecionado para cancelamento');
      return;
    }
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
