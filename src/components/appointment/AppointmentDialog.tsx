
import { AppointmentWithDetails } from "@/types/appointment.types";
import { DialogContainer } from "./dialog/DialogContainer";

interface AppointmentDialogProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated?: () => void;
}

export function AppointmentDialog({
  appointment,
  isOpen,
  onClose,
  onAppointmentUpdated
}: AppointmentDialogProps) {
  return (
    <DialogContainer
      appointment={appointment}
      isOpen={isOpen}
      onClose={onClose}
      onAppointmentUpdated={onAppointmentUpdated}
    />
  );
}
