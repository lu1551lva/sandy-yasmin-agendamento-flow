
import { useUpdateAppointmentStatus } from './useUpdateAppointmentStatus';
import { AppointmentStatus } from '@/types/appointment.types';

export const useAppointmentStatusUpdate = () => {
  const { updateStatus, deleteAppointment, isLoading } = useUpdateAppointmentStatus();

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus, reason?: string) => {
    // Delega para o hook principal e retorna o resultado
    return await updateStatus(appointmentId, newStatus, reason);
  };

  return {
    updateStatus: updateAppointmentStatus,
    deleteAppointment,
    isLoading,
  };
};
