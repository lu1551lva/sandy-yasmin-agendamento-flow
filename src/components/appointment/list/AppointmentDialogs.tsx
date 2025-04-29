
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { useAppointmentDialogsState } from "./hooks/useAppointmentDialogsState";
import { AppointmentDetailsDialog } from "./components/AppointmentDetailsDialog";
import { AppointmentStatusUpdateDialog } from "./components/AppointmentStatusUpdateDialog";
import { AppointmentCancelDialog } from "./components/AppointmentCancelDialog";
import { AppointmentRescheduleDialog } from "./components/AppointmentRescheduleDialog";
import { validateAppointmentId } from "@/utils/debugUtils";

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
  // Get dialog state and actions from the hooks
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

  // Function to wrap handleReschedule to ensure it returns a Promise<boolean>
  const handleRescheduleWrapper = async (date: Date, time: string): Promise<boolean> => {
    if (!selectedAppointment) return false;
    // Fix: Only passing date and time to handleReschedule (it already gets selectedAppointment from the state)
    return handleReschedule(date, time);
  };

  // Validate IDs before rendering to prevent issues
  const isAppointmentToUpdateValid = appointmentToUpdate && validateAppointmentId(appointmentToUpdate.id);
  const isAppointmentToCancelValid = validateAppointmentId(appointmentToCancel);

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
      {isAppointmentToUpdateValid && (
        <AppointmentStatusUpdateDialog
          isOpen={!!appointmentToUpdate}
          onOpenChange={(open) => !open && setAppointmentToUpdate(null)}
          status={appointmentToUpdate?.status || null}
          onConfirm={handleUpdateStatus}
          isLoading={isLoading}
        />
      )}
      
      {/* Cancel Dialog */}
      <AppointmentCancelDialog
        isOpen={isCancelDialogOpen}
        onClose={() => {
          setIsCancelDialogOpen(false);
          setAppointmentToCancel(null);
          setCancelReason("");
        }}
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
        onReschedule={handleRescheduleWrapper}
        isLoading={isReschedulingLoading}
      />
    </>
  );
}
