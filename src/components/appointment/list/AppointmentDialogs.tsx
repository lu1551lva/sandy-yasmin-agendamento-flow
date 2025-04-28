
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { CancelAppointmentDialog } from "@/components/appointment/CancelAppointmentDialog";
import { StatusUpdateDialog } from "@/components/appointment/StatusUpdateDialog";
import { AppointmentDialog } from "@/components/appointment/AppointmentDialog";
import { RescheduleDialog } from "@/components/appointment/RescheduleDialog";
import { useState } from "react";
import { useAppointmentStatusUpdate } from "@/hooks/useAppointmentStatusUpdate";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";

interface AppointmentDialogsProps {
  selectedAppointment: AppointmentWithDetails | null;
  setSelectedAppointment: (appointment: AppointmentWithDetails | null) => void;
  appointmentToUpdate: { id: string; status: AppointmentStatus } | null;
  setAppointmentToUpdate: (data: { id: string; status: AppointmentStatus } | null) => void;
  isCancelDialogOpen: boolean;
  setIsCancelDialogOpen: (open: boolean) => void;
  appointmentToCancel: string | null;
  setAppointmentToCancel: (id: string | null) => void;
  onAppointmentUpdated: () => void;
}

export function AppointmentDialogs({
  selectedAppointment,
  setSelectedAppointment,
  appointmentToUpdate,
  setAppointmentToUpdate,
  isCancelDialogOpen,
  setIsCancelDialogOpen,
  appointmentToCancel,
  setAppointmentToCancel,
  onAppointmentUpdated
}: AppointmentDialogsProps) {
  const [cancelReason, setCancelReason] = useState("");
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
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

  return (
    <>
      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDialog
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onAppointmentUpdated={onAppointmentUpdated}
        />
      )}
      
      {/* Status Update Dialog (Complete) */}
      <StatusUpdateDialog
        isOpen={!!appointmentToUpdate}
        onOpenChange={(open) => !open && setAppointmentToUpdate(null)}
        status={appointmentToUpdate?.status || null}
        onConfirm={handleUpdateStatus}
        isLoading={isLoading}
      />
      
      {/* Cancel Dialog */}
      <CancelAppointmentDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={handleCancel}
        isLoading={isLoading}
      />
      
      {/* Reschedule Dialog */}
      {selectedAppointment && (
        <RescheduleDialog
          appointment={selectedAppointment}
          isOpen={isRescheduleDialogOpen}
          onClose={() => setIsRescheduleDialogOpen(false)}
          onReschedule={handleReschedule}
          isLoading={isReschedulingLoading}
        />
      )}
    </>
  );
}
