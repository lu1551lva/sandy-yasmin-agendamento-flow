
import { useUpdateAppointmentStatus } from './useUpdateAppointmentStatus';
import { AppointmentStatus } from '@/types/appointment.types';

export const useAppointmentStatusUpdate = () => {
  const { updateStatus, deleteAppointment, isLoading } = useUpdateAppointmentStatus();

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus, reason?: string) => {
    // Delegate to the main hook and return the result
    const result = await updateStatus(appointmentId, newStatus, reason);
    console.log(`Status update result for appointment ${appointmentId}: ${result}`);
    return result;
  };

  return {
    updateStatus: updateAppointmentStatus,
    deleteAppointment,
    isLoading,
  };
};
