
import { useUpdateAppointmentStatus } from './useUpdateAppointmentStatus';
import { AppointmentStatus } from '@/types/appointment.types';

export const useAppointmentStatusUpdate = () => {
  const { updateStatus, deleteAppointment, isLoading } = useUpdateAppointmentStatus();

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus, reason?: string) => {
    console.log(`Iniciando atualização do agendamento ${appointmentId} para status ${newStatus}${reason ? ' com motivo: ' + reason : ''}`);
    
    // Delegate to the main hook and log the result
    const result = await updateStatus(appointmentId, newStatus, reason);
    
    if (result) {
      console.log(`Atualização do agendamento ${appointmentId} para status ${newStatus} concluída com sucesso`);
    } else {
      console.error(`Falha na atualização do agendamento ${appointmentId} para status ${newStatus}`);
    }
    
    return result;
  };

  return {
    updateStatus: updateAppointmentStatus,
    deleteAppointment,
    isLoading,
  };
};
