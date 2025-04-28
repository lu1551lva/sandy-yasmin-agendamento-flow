
import { CancelAppointmentDialog } from "@/components/appointment/CancelAppointmentDialog";

interface AppointmentCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function AppointmentCancelDialog({
  isOpen,
  onClose,
  reason,
  onReasonChange,
  onConfirm,
  isLoading
}: AppointmentCancelDialogProps) {
  return (
    <CancelAppointmentDialog
      isOpen={isOpen}
      onClose={onClose}
      reason={reason}
      onReasonChange={onReasonChange}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
