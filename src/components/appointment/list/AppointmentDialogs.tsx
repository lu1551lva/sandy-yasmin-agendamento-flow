
import { useAppointmentDialog } from "../context/AppointmentDialogContext";
import { AppointmentDialogManager } from "./components/AppointmentDialogManager";

interface AppointmentDialogsProps {
  onAppointmentUpdated: () => void;
}

export function AppointmentDialogs({
  onAppointmentUpdated
}: AppointmentDialogsProps) {
  return (
    <AppointmentDialogManager />
  );
}
