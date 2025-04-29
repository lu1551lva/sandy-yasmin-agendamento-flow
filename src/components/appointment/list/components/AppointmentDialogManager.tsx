
import { AppointmentDetailsDialog } from "./AppointmentDetailsDialog";
import { AppointmentStatusUpdateDialog } from "./AppointmentStatusUpdateDialog";
import { AppointmentCancelDialog } from "./AppointmentCancelDialog";
import { AppointmentRescheduleDialog } from "./AppointmentRescheduleDialog";
import { useAppointmentDialog } from "../../context/AppointmentDialogContext";

export function AppointmentDialogManager() {
  const { 
    selectedAppointment,
    appointmentToUpdate,
    isStatusDialogOpen, 
    closeStatusUpdateDialog,
    isCancelDialogOpen,
    closeCancelDialog,
    isRescheduleDialogOpen,
    closeRescheduleDialog,
    closeAppointmentDetails
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
          status={appointmentToUpdate.status || null}
        />
      )}
      
      {/* Cancel Dialog */}
      <AppointmentCancelDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={(open) => !open && closeCancelDialog()}
      />
      
      {/* Reschedule Dialog */}
      <AppointmentRescheduleDialog
        isOpen={isRescheduleDialogOpen}
        onOpenChange={(open) => !open && closeRescheduleDialog()}
      />
    </>
  );
}
