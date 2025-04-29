
import { AppointmentDialog } from "../../AppointmentDialog";
import { AppointmentWithDetails } from "@/types/appointment.types";

interface AppointmentDetailsDialogProps {
  appointment: AppointmentWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated: () => void;
}

export function AppointmentDetailsDialog({
  appointment,
  isOpen,
  onClose,
  onAppointmentUpdated
}: AppointmentDetailsDialogProps) {
  if (!appointment) {
    return null;
  }

  return (
    <AppointmentDialog
      appointment={appointment}
      isOpen={isOpen}
      onClose={onClose}
      onAppointmentUpdated={onAppointmentUpdated}
    />
  );
}
