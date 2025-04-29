
import { AppointmentWithDetails } from "@/types/appointment.types";
import { RescheduleDialog } from "../../RescheduleDialog";

interface AppointmentRescheduleDialogProps {
  appointment: AppointmentWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (date: Date, time: string) => Promise<boolean>;
  isLoading: boolean;
}

export function AppointmentRescheduleDialog({
  appointment,
  isOpen,
  onClose,
  onReschedule,
  isLoading
}: AppointmentRescheduleDialogProps) {
  if (!appointment) {
    return null;
  }

  return (
    <RescheduleDialog
      appointment={appointment}
      isOpen={isOpen}
      onClose={onClose}
      onReschedule={onReschedule}
      isLoading={isLoading}
    />
  );
}
