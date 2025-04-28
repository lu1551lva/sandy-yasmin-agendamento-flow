
import { AppointmentWithDetails } from "@/types/appointment.types";

interface AppointmentGrouperProps {
  appointments: AppointmentWithDetails[];
  showAll: boolean;
}

export function useAppointmentGrouper({ appointments, showAll }: AppointmentGrouperProps) {
  // Filter active appointments unless showAll is true
  const filteredAppointments = showAll 
    ? appointments 
    : appointments.filter(appointment => appointment.status !== "cancelado");

  // Group appointments by status for better organization
  const groupedAppointments = {
    agendado: filteredAppointments.filter(app => app.status === "agendado"),
    concluido: filteredAppointments.filter(app => app.status === "concluido"),
    cancelado: filteredAppointments.filter(app => app.status === "cancelado" && showAll),
  };

  return {
    filteredAppointments,
    groupedAppointments,
    isEmpty: !filteredAppointments || filteredAppointments.length === 0
  };
}
