
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { useAppointmentDialogsState } from "./hooks/useAppointmentDialogsState";
import { AppointmentDetailsDialog } from "./components/AppointmentDetailsDialog";
import { AppointmentStatusUpdateDialog } from "./components/AppointmentStatusUpdateDialog";
import { AppointmentCancelDialog } from "./components/AppointmentCancelDialog";
import { AppointmentRescheduleDialog } from "./components/AppointmentRescheduleDialog";

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
  const {
    cancelReason,
    setCancelReason,
    isRescheduleDialogOpen,
    setIsRescheduleDialogOpen,
    isLoading,
    isReschedulingLoading,
    handleUpdateStatus,
    handleCancel,
    handleReschedule
  } = useAppointmentDialogsState(onAppointmentUpdated);

  return (
    <>
      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onAppointmentUpdated={onAppointmentUpdated}
      />
      
      {/* Status Update Dialog (Complete) */}
      <AppointmentStatusUpdateDialog
        isOpen={!!appointmentToUpdate}
        onOpenChange={(open) => !open && setAppointmentToUpdate(null)}
        status={appointmentToUpdate?.status || null}
        onConfirm={handleUpdateStatus}
        isLoading={isLoading}
      />
      
      {/* Cancel Dialog */}
      <AppointmentCancelDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={handleCancel}
        isLoading={isLoading}
        appointmentId={appointmentToCancel}
      />
      
      {/* Reschedule Dialog */}
      <AppointmentRescheduleDialog
        appointment={selectedAppointment}
        isOpen={isRescheduleDialogOpen}
        onClose={() => setIsRescheduleDialogOpen(false)}
        onReschedule={handleReschedule}
        isLoading={isReschedulingLoading}
      />
    </>
  );
}
