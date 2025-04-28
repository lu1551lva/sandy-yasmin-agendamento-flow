
import { StatusUpdateDialog } from "@/components/appointment/StatusUpdateDialog";
import { AppointmentStatus } from "@/types/appointment.types";

interface AppointmentStatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  status: AppointmentStatus | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function AppointmentStatusUpdateDialog({
  isOpen,
  onOpenChange,
  status,
  onConfirm,
  isLoading
}: AppointmentStatusUpdateDialogProps) {
  return (
    <StatusUpdateDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      status={status}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
