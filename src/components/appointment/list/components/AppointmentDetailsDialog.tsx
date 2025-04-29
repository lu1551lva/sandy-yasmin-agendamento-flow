
import { AppointmentWithDetails } from "@/types/appointment.types";
import { DialogContainer } from "../../dialog/DialogContainer";

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
    <DialogContainer
      appointment={appointment}
      isOpen={isOpen}
      onClose={onClose}
      onAppointmentUpdated={onAppointmentUpdated}
    />
  );
}
