
import { StatusUpdateDialog } from "../../StatusUpdateDialog";
import { AppointmentStatus } from "@/types/appointment.types";
import { validateAppointmentId } from "@/utils/debugUtils";

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
  // Only render the dialog if we have a valid status
  if (!status) {
    return null;
  }
  
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
