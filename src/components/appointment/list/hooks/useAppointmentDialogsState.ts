
import { useState } from "react";
import { AppointmentStatus, AppointmentWithDetails } from "@/types/appointment.types";
import { useAppointmentStatusUpdate } from "@/hooks/useAppointmentStatusUpdate";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";

export function useAppointmentDialogsState(onAppointmentUpdated: () => void) {
  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{ id: string; status: AppointmentStatus } | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Hooks for API operations
  const { updateStatus, isLoading } = useAppointmentStatusUpdate();
  const { rescheduleAppointment, isLoading: isReschedulingLoading } = useRescheduleAppointment();

  // Handle updating appointment status
  const handleUpdateStatus = async () => {
    if (!appointmentToUpdate) return;
    
    console.log(`Tentando atualizar agendamento ${appointmentToUpdate.id} para status ${appointmentToUpdate.status}`);
    const success = await updateStatus(
      appointmentToUpdate.id, 
      appointmentToUpdate.status
    );
    
    if (success) {
      console.log(`Agendamento ${appointmentToUpdate.id} atualizado com sucesso para ${appointmentToUpdate.status}`);
      setAppointmentToUpdate(null);
      onAppointmentUpdated();
    } else {
      console.error(`Falha ao atualizar agendamento ${appointmentToUpdate.id}`);
    }
  };

  // Handle cancelling appointment
  const handleCancel = async () => {
    if (!appointmentToCancel) return;
    
    console.log(`Tentando cancelar agendamento ${appointmentToCancel} com motivo: ${cancelReason || "Não especificado"}`);
    const success = await updateStatus(
      appointmentToCancel, 
      "cancelado", 
      cancelReason || "Cancelamento sem motivo especificado"
    );
    
    if (success) {
      console.log(`Agendamento ${appointmentToCancel} cancelado com sucesso`);
      setIsCancelDialogOpen(false);
      setAppointmentToCancel(null);
      setCancelReason("");
      onAppointmentUpdated();
    } else {
      console.error(`Falha ao cancelar agendamento ${appointmentToCancel}`);
    }
  };

  // Handle appointment reschedule
  const handleReschedule = async (date: Date, time: string) => {
    if (!selectedAppointment) return;
    
    try {
      console.log(`Tentando reagendar agendamento ${selectedAppointment.id} para ${date} às ${time}`);
      await rescheduleAppointment(
        selectedAppointment.id, 
        date, 
        time,
        selectedAppointment.profissional.id
      );
      setIsRescheduleDialogOpen(false);
      onAppointmentUpdated();
      console.log(`Agendamento ${selectedAppointment.id} reagendado com sucesso`);
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao reagendar:", error);
      return Promise.reject(error);
    }
  };

  return {
    // Dialog states
    selectedAppointment,
    setSelectedAppointment,
    appointmentToUpdate,
    setAppointmentToUpdate,
    appointmentToCancel,
    setAppointmentToCancel,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    isRescheduleDialogOpen,
    setIsRescheduleDialogOpen,
    cancelReason,
    setCancelReason,
    
    // Loading states
    isLoading,
    isReschedulingLoading,
    
    // Handlers
    handleUpdateStatus,
    handleCancel,
    handleReschedule
  };
}
