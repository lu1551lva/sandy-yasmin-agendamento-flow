
import { createContext, useContext } from 'react';
import { AppointmentDialogContextType, AppointmentDialogProviderProps } from './types';
import { useDialogStateManagement } from './hooks/useDialogStateManagement';
import { useAppointmentHandlers } from './hooks/useAppointmentHandlers';

const AppointmentDialogContext = createContext<AppointmentDialogContextType | undefined>(undefined);

export const useAppointmentDialog = () => {
  const context = useContext(AppointmentDialogContext);
  if (context === undefined) {
    throw new Error('useAppointmentDialog must be used within an AppointmentDialogProvider');
  }
  return context;
};

export function AppointmentDialogProvider({ 
  children, 
  onAppointmentUpdated 
}: AppointmentDialogProviderProps) {
  // Get dialog state management from hook
  const dialogState = useDialogStateManagement();
  
  // Destructuring dialogState for needed values
  const {
    selectedAppointment,
    appointmentToUpdate,
    appointmentToCancel,
    cancelReason,
    isStatusDialogOpen,
    isCancelDialogOpen,
    isRescheduleDialogOpen,
    validateAppointmentExists,
    openAppointmentDetails,
    closeAppointmentDetails,
    openStatusUpdateDialog,
    closeStatusUpdateDialog,
    openCancelDialog,
    closeCancelDialog,
    openRescheduleDialog,
    closeRescheduleDialog,
    setSelectedAppointment,
    setCancelReason
  } = dialogState;

  // Get appointment handlers
  const {
    isLoading,
    isReschedulingLoading,
    handleStatusUpdate,
    handleCancel,
    handleReschedule,
    handleAppointmentUpdated
  } = useAppointmentHandlers({
    selectedAppointment,
    appointmentToUpdate,
    appointmentToCancel,
    cancelReason,
    validateAppointmentExists,
    closeStatusUpdateDialog,
    closeCancelDialog,
    closeRescheduleDialog,
    onAppointmentUpdated
  });

  const value: AppointmentDialogContextType = {
    // State
    selectedAppointment,
    appointmentToUpdate,
    appointmentToCancel,
    cancelReason,
    isStatusDialogOpen,
    isCancelDialogOpen,
    isRescheduleDialogOpen,
    isLoading,
    isReschedulingLoading,
    
    // Actions
    openAppointmentDetails,
    closeAppointmentDetails,
    openStatusUpdateDialog,
    closeStatusUpdateDialog,
    openCancelDialog,
    closeCancelDialog,
    openRescheduleDialog,
    closeRescheduleDialog,
    handleStatusUpdate,
    handleCancel,
    handleReschedule,
    validateAppointmentExists,
    handleAppointmentUpdated,
    
    // Helpers
    setSelectedAppointment,
    setCancelReason
  };

  return (
    <AppointmentDialogContext.Provider value={value}>
      {children}
    </AppointmentDialogContext.Provider>
  );
}
