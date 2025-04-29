
import { AppointmentWithDetails } from "@/types/appointment.types";
import { DialogContainer } from "../../dialog/DialogContainer";
import { useAppointmentDialog } from "../../context/AppointmentDialogContext";

interface AppointmentDetailsDialogProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetailsDialog({
  appointment,
  isOpen,
  onClose,
}: AppointmentDetailsDialogProps) {
  if (!appointment) {
    return null;
  }

  return (
    <DialogContainer
      appointment={appointment}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
