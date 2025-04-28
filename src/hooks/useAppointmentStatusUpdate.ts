
import { useUpdateAppointmentStatus } from './useUpdateAppointmentStatus';
import { AppointmentStatus } from '@/types/appointment.types';

export const useAppointmentStatusUpdate = () => {
  const { updateStatus, isLoading } = useUpdateAppointmentStatus();

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus, reason?: string) => {
    return await updateStatus(appointmentId, newStatus, reason);
  };

  return {
    updateStatus: updateAppointmentStatus,
    isLoading,
  };
};
