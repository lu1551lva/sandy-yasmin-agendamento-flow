
import { useAppointmentDialog } from "../../context/AppointmentDialogContext";
import { RescheduleDialog } from "../../RescheduleDialog";

interface AppointmentRescheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentRescheduleDialog({
  isOpen,
  onOpenChange,
}: AppointmentRescheduleDialogProps) {
  const { selectedAppointment, handleReschedule, isReschedulingLoading } = useAppointmentDialog();
  
  if (!selectedAppointment) {
    return null;
  }

  return (
    <RescheduleDialog
      appointment={selectedAppointment}
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      onReschedule={handleReschedule}
      isLoading={isReschedulingLoading}
    />
  );
}
