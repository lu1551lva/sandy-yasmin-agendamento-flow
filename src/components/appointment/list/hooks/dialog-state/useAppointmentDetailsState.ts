
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { logUIEvent } from "@/utils/debugUtils";

/**
 * Hook for managing appointment details dialog state
 */
export function useAppointmentDetailsState() {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  
  const showAppointmentDetails = (appointment: AppointmentWithDetails) => {
    logUIEvent("Opening appointment details dialog", appointment.id);
    setSelectedAppointment(appointment);
  };
  
  const closeAppointmentDetails = () => {
    logUIEvent("Closing appointment details dialog");
    setSelectedAppointment(null);
  };

  return {
    selectedAppointment,
    setSelectedAppointment,
    showAppointmentDetails,
    closeAppointmentDetails
  };
}
