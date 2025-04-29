
import { AppointmentDetailsDialog } from "./AppointmentDetailsDialog";
import { AppointmentStatusUpdateDialog } from "./AppointmentStatusUpdateDialog";
import { AppointmentCancelDialog } from "./AppointmentCancelDialog";
import { AppointmentRescheduleDialog } from "./AppointmentRescheduleDialog";
import { useAppointmentDialog } from "../../context/AppointmentDialogContext";

export function AppointmentDialogManager() {
  const { 
    selectedAppointment,
    appointmentToUpdate,
    appointmentToCancel,
    cancelReason,
    isStatusDialogOpen, 
    closeStatusUpdateDialog,
    isCancelDialogOpen,
    closeCancelDialog,
    isRescheduleDialogOpen,
    closeRescheduleDialog,
    closeAppointmentDetails,
    handleStatusUpdate,
    handleCancel,
    setCancelReason,
    handleAppointmentUpdated
  } = useAppointmentDialog();

  return (
    <>
      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={closeAppointmentDetails}
        />
      )}
      
      {/* Status Update Dialog */}
      {appointmentToUpdate && (
        <AppointmentStatusUpdateDialog
          isOpen={isStatusDialogOpen}
          onOpenChange={(open) => !open && closeStatusUpdateDialog()}
          status={appointmentToUpdate.status}
          appointmentId={appointmentToUpdate.id}
          onStatusUpdated={() => {
            closeStatusUpdateDialog();
            handleAppointmentUpdated();
          }}
        />
      )}
      
      {/* Cancel Dialog */}
      {appointmentToCancel && (
        <AppointmentCancelDialog
          isOpen={isCancelDialogOpen}
          onOpenChange={(open) => !open && closeCancelDialog()}
          appointmentId={appointmentToCancel}
          reason={cancelReason}
          onReasonChange={(reason) => setCancelReason(reason)}
          onCanceled={() => {
            closeCancelDialog();
            handleAppointmentUpdated();
          }}
        />
      )}
      
      {/* Reschedule Dialog */}
      <AppointmentRescheduleDialog
        isOpen={isRescheduleDialogOpen}
        onOpenChange={(open) => !open && closeRescheduleDialog()}
      />
    </>
  );
}
