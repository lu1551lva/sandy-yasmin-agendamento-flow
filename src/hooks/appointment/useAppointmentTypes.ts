
import { AppointmentStatus, AppointmentWithDetails } from "@/types/appointment.types";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Common types used across appointment hooks
 */

// Database operation result types
export type DatabaseResult<T = any> = {
  data: T | null;
  error: PostgrestError | Error | null;
  success: boolean;
};

// Status update parameters
export type StatusUpdateParams = {
  appointmentId: string;
  status: AppointmentStatus;
  reason?: string;
};

// Reschedule parameters
export type RescheduleParams = {
  appointmentId: string;
  date: Date;
  time: string;
  professionalId: string;
};

// Appointment action callback type
export type AppointmentActionCallback = () => void;

// Dialog state for appointment actions
export interface AppointmentDialogState {
  selectedAppointment: AppointmentWithDetails | null;
  appointmentToUpdate: { id: string; status: AppointmentStatus } | null;
  appointmentToCancel: string | null;
  isCancelDialogOpen: boolean;
  isRescheduleDialogOpen: boolean;
  cancelReason: string;
  isLoading: boolean;
}
