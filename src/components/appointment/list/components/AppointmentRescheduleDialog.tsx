
import { RescheduleDialog } from "@/components/appointment/RescheduleDialog";
import { AppointmentWithDetails } from "@/types/appointment.types";

interface AppointmentRescheduleDialogProps {
  appointment: AppointmentWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (date: Date, time: string) => Promise<void>;
  isLoading: boolean;
}

export function AppointmentRescheduleDialog({
  appointment,
  isOpen,
  onClose,
  onReschedule,
  isLoading
}: AppointmentRescheduleDialogProps) {
  if (!appointment) return null;
  
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
