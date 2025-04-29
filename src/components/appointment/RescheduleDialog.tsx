
import { AppointmentWithDetails } from "@/types/appointment.types";
import { RescheduleDialog as RescheduleDialogComponent } from "./dialog/reschedule/RescheduleDialog";

interface RescheduleDialogProps {
  appointment: AppointmentWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (date: Date, time: string) => Promise<boolean>;
  isLoading: boolean;
}

export function RescheduleDialog({
  appointment,
  isOpen,
  onClose,
  onReschedule,
  isLoading
}: RescheduleDialogProps) {
  if (!appointment) {
    return null;
  }

  return (
    <RescheduleDialogComponent
      appointment={appointment}
      isOpen={isOpen}
      onClose={onClose}
      onReschedule={onReschedule}
      isLoading={isLoading}
    />
  );
}
