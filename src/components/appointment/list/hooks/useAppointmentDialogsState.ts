
import { useAppointmentDetailsState } from "./dialog-state/useAppointmentDetailsState";
import { useStatusUpdateState } from "./dialog-state/useStatusUpdateState";
import { useCancelDialogState } from "./dialog-state/useCancelDialogState";
import { useRescheduleDialogState } from "./dialog-state/useRescheduleDialogState";
import { useDebugState } from "./dialog-state/useDebugState";

/**
 * Hook that combines all dialog state hooks to manage appointment dialogs state
 */
export function useAppointmentDialogsState(onAppointmentUpdated: () => void) {
  // Appointment details state
  const {
    selectedAppointment,
    setSelectedAppointment,
    showAppointmentDetails,
    closeAppointmentDetails
  } = useAppointmentDetailsState();

  // Status update state
  const {
    appointmentToUpdate,
    setAppointmentToUpdate,
    isLoading: isStatusUpdateLoading,
    handleUpdateStatus
  } = useStatusUpdateState(onAppointmentUpdated);

  // Cancel dialog state
  const {
    appointmentToCancel,
    setAppointmentToCancel,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    cancelReason,
    setCancelReason,
    isLoading: isCancelLoading,
    openCancelDialog,
    closeCancelDialog,
    handleCancel
  } = useCancelDialogState(onAppointmentUpdated);

  // Reschedule dialog state
  const {
    isRescheduleDialogOpen,
    setIsRescheduleDialogOpen,
    isReschedulingLoading,
    handleReschedule: baseHandleReschedule
  } = useRescheduleDialogState(onAppointmentUpdated);

  // Wrapper for handleReschedule to provide the selectedAppointment
  const handleReschedule = (date: Date, time: string) => {
    return baseHandleReschedule(selectedAppointment, date, time);
  };

  // Combined loading state
  const isLoading = isStatusUpdateLoading || isCancelLoading;

  // Debug state
  const state = {
    selectedAppointment: selectedAppointment?.id || null,
    appointmentToUpdate,
    appointmentToCancel,
    isCancelDialogOpen,
    isRescheduleDialogOpen,
    cancelReason,
    isLoading,
    isReschedulingLoading
  };
  
  const { debugCurrentState } = useDebugState(state);

  return {
    // Details dialog
    selectedAppointment,
    setSelectedAppointment,
    
    // Status update dialog
    appointmentToUpdate,
    setAppointmentToUpdate,
    
    // Cancel dialog
    appointmentToCancel,
    setAppointmentToCancel,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    cancelReason,
    setCancelReason,
    
    // Reschedule dialog
    isRescheduleDialogOpen,
    setIsRescheduleDialogOpen,
    
    // Loading states
    isLoading,
    isReschedulingLoading,
    
    // Actions
    handleUpdateStatus,
    handleCancel,
    handleReschedule,
    
    // Debug
    debugCurrentState
  };
}
