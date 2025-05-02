
import { useCallback } from "react";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";

import { useStatusUpdateHandler } from "./handlers/useStatusUpdateHandler";
import { useCancelHandler } from "./handlers/useCancelHandler";
import { useDeleteHandler } from "./handlers/useDeleteHandler";
import { useRescheduleHandler } from "./handlers/useRescheduleHandler";
import { useCacheHandler } from "./handlers/useCacheHandler";

interface UseAppointmentHandlersProps {
  selectedAppointment: AppointmentWithDetails | null;
  appointmentToUpdate: { id: string; status: AppointmentStatus } | null;
  appointmentToCancel: string | null;
  cancelReason: string;
  validateAppointmentExists: (id: string | null) => boolean;
  closeStatusUpdateDialog: () => void;
  closeCancelDialog: () => void;
  closeRescheduleDialog: () => void;
  onAppointmentUpdated: () => void;
}

export function useAppointmentHandlers({
  selectedAppointment,
  appointmentToUpdate,
  appointmentToCancel,
  cancelReason,
  validateAppointmentExists,
  closeStatusUpdateDialog,
  closeCancelDialog,
  closeRescheduleDialog,
  onAppointmentUpdated
}: UseAppointmentHandlersProps) {
  const { isLoading: isDeletingLoading } = useUpdateAppointmentStatus();
  const { isLoading: isReschedulingLoading } = useRescheduleAppointment();

  // Import specialized handlers
  const { handleAppointmentUpdated } = useCacheHandler({ 
    onAppointmentUpdated 
  });
  
  const { handleStatusUpdate } = useStatusUpdateHandler({
    appointmentToUpdate,
    validateAppointmentExists,
    closeStatusUpdateDialog,
    handleAppointmentUpdated
  });
  
  const { handleCancel } = useCancelHandler({
    appointmentToCancel,
    cancelReason,
    validateAppointmentExists,
    closeCancelDialog,
    handleAppointmentUpdated
  });
  
  const { handleDelete } = useDeleteHandler({
    selectedAppointment,
    validateAppointmentExists,
    handleAppointmentUpdated
  });
  
  const { handleReschedule } = useRescheduleHandler({
    selectedAppointment,
    validateAppointmentExists,
    closeRescheduleDialog,
    handleAppointmentUpdated
  });

  // Combine loading states
  const isLoading = isDeletingLoading || isReschedulingLoading;

  return {
    isLoading,
    isReschedulingLoading,
    handleStatusUpdate,
    handleCancel,
    handleReschedule,
    handleAppointmentUpdated,
    handleDelete
  };
}
