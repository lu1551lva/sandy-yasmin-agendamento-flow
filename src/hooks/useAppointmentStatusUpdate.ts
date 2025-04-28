
import { useUpdateAppointmentStatus } from './useUpdateAppointmentStatus';
import { AppointmentStatus } from '@/types/appointment.types';

export const useAppointmentStatusUpdate = () => {
  const { updateStatus, deleteAppointment, isLoading } = useUpdateAppointmentStatus();

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus, reason?: string) => {
    // Delegate to the main hook and return the result
    console.log(`Chamando updateStatus para agendamento ${appointmentId} com status ${newStatus}`);
    const result = await updateStatus(appointmentId, newStatus, reason);
    console.log(`Resultado da atualização para agendamento ${appointmentId}: ${result ? 'sucesso' : 'falha'}`);
    return result;
  };

  return {
    updateStatus: updateAppointmentStatus,
    deleteAppointment,
    isLoading,
  };
};
