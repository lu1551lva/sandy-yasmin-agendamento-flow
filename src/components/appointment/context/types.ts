
import { ReactNode } from "react";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";

export interface AppointmentDialogProviderProps {
  children: ReactNode;
  onAppointmentUpdated?: () => void;
}

export interface AppointmentDialogContextType {
  // State
  selectedAppointment: AppointmentWithDetails | null;
  appointmentToUpdate: { id: string; status: AppointmentStatus } | null;
  appointmentToCancel: string | null;
  cancelReason: string;
  isStatusDialogOpen: boolean;
  isCancelDialogOpen: boolean;
  isRescheduleDialogOpen: boolean;
  isLoading: boolean;
  isReschedulingLoading: boolean;
  
  // Actions
  openAppointmentDetails: (appointment: AppointmentWithDetails) => void;
  closeAppointmentDetails: () => void;
  openStatusUpdateDialog: (id: string, status: AppointmentStatus) => void;
  closeStatusUpdateDialog: () => void;
  openCancelDialog: (id: string) => void;
  closeCancelDialog: () => void;
  openRescheduleDialog: (appointment: AppointmentWithDetails) => void;
  closeRescheduleDialog: () => void;
  handleStatusUpdate: () => Promise<boolean>;
  handleCancel: () => Promise<boolean>;
  handleReschedule: (date: Date, time: string) => Promise<boolean>;
  handleDelete: () => Promise<boolean>; // Add the new delete handler
  validateAppointmentExists: (id: string | null) => boolean;
  handleAppointmentUpdated: () => void;
  
  // Helpers
  setSelectedAppointment: (appointment: AppointmentWithDetails | null) => void;
  setCancelReason: (reason: string) => void;
}
