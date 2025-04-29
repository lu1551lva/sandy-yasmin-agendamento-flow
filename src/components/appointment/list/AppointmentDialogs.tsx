
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { AppointmentDialogManager } from "./components/AppointmentDialogManager";
import { AppointmentDialogProvider } from "../context/AppointmentDialogContext";

interface AppointmentDialogsProps {
  onAppointmentUpdated: () => void;
}

export function AppointmentDialogs({
  onAppointmentUpdated
}: AppointmentDialogsProps) {
  return (
    <AppointmentDialogProvider onAppointmentUpdated={onAppointmentUpdated}>
      <AppointmentDialogManager />
    </AppointmentDialogProvider>
  );
}
