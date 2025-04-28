
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
    
    const success = await updateStatus(
      appointmentToUpdate.id, 
      appointmentToUpdate.status
    );
    
    if (success) {
      setAppointmentToUpdate(null);
      onAppointmentUpdated();
    }
  };

  // Handle cancelling appointment
  const handleCancel = async () => {
    if (!appointmentToCancel) return;
    
    const success = await updateStatus(
      appointmentToCancel, 
      "cancelado", 
      cancelReason || "Cancelamento sem motivo especificado"
    );
    
    if (success) {
      setIsCancelDialogOpen(false);
      setAppointmentToCancel(null);
      setCancelReason("");
      onAppointmentUpdated();
    }
  };

  // Handle appointment reschedule
  const handleReschedule = async (date: Date, time: string) => {
    if (!selectedAppointment) return;
    
    try {
      await rescheduleAppointment(
        selectedAppointment.id, 
        date, 
        time,
        selectedAppointment.profissional.id
      );
      setIsRescheduleDialogOpen(false);
      onAppointmentUpdated();
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
