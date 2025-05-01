
import { useAppointmentStatus } from "./database/useAppointmentStatus";
import { useAppointmentRescheduling } from "./database/useAppointmentRescheduling";
import { useAppointmentHistory } from "./database/useAppointmentHistory";
import { useAppointmentDetails } from "./database/useAppointmentDetails";
import { useAppointmentDeletion } from "./database/useAppointmentDeletion";

/**
 * Combined hook for handling database operations related to appointments
 */
export const useAppointmentDatabase = () => {
  const { updateAppointmentStatus } = useAppointmentStatus();
  const { rescheduleAppointment } = useAppointmentRescheduling();
  const { createHistoryEntry, getAppointmentHistory } = useAppointmentHistory();
  const { getAppointmentById } = useAppointmentDetails();
  const { deleteAppointmentWithHistory } = useAppointmentDeletion();

  return {
    // Status operations
    updateAppointmentStatus,
    
    // Rescheduling operations
    rescheduleAppointment,
    
    // History operations
    createHistoryEntry,
    getAppointmentHistory,
    
    // Deletion operations
    deleteAppointmentWithHistory,
    
    // Detail operations
    getAppointmentById
  };
};
