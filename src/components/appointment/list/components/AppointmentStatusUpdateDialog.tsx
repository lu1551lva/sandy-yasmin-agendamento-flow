
import { StatusUpdateDialog } from "../../StatusUpdateDialog";
import { AppointmentStatus } from "@/types/appointment.types";
import { useAppointmentDialog } from "../../context/AppointmentDialogContext";

interface AppointmentStatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  status: AppointmentStatus | null;
}

export function AppointmentStatusUpdateDialog({
  isOpen,
  onOpenChange,
  status,
}: AppointmentStatusUpdateDialogProps) {
  const { handleStatusUpdate, isLoading } = useAppointmentDialog();
  
  // Only render the dialog if we have a valid status
  if (!status) {
    return null;
  }
  
  return (
    <StatusUpdateDialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        // Only allow closing if not loading
        if (!isLoading || !open) {
          onOpenChange(open);
        }
      }}
      status={status}
      onConfirm={async () => {
        const success = await handleStatusUpdate();
        if (success) {
          onOpenChange(false);
        }
      }}
      isLoading={isLoading}
    />
  );
}
