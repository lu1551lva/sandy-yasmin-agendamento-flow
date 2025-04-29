
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { logUIEvent } from "@/utils/debugUtils";

/**
 * Hook for managing appointment details dialog state
 */
export function useAppointmentDetailsState() {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  
  /**
   * Opens the appointment details dialog
   */
  const showAppointmentDetails = (appointment: AppointmentWithDetails) => {
    if (!appointment || !appointment.id) {
      console.error("Tentativa de abrir detalhes com agendamento inválido", appointment);
      return;
    }
    
    logUIEvent("Opening appointment details dialog", appointment.id);
    setSelectedAppointment(appointment);
  };
  
  /**
   * Closes the appointment details dialog
   */
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
