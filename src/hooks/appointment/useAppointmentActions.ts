
import { useState } from "react";
import { useCompleteAppointment } from "./actions/useCompleteAppointment";
import { useCancelAppointment } from "./actions/useCancelAppointment";
import { useRescheduleAppointment } from "./actions/useRescheduleAppointment";
import { useDeleteAppointment } from "./actions/useDeleteAppointment";
import { useAppointmentCacheInvalidation } from "./actions/useAppointmentCache";

/**
 * Main hook that combines all appointment action hooks
 */
export const useAppointmentActions = () => {
  const { completeAppointment, isLoading: isCompletingLoading } = useCompleteAppointment();
  const { cancelAppointment, isLoading: isCancelingLoading } = useCancelAppointment();
  const { rescheduleAppointment, isLoading: isReschedulingLoading } = useRescheduleAppointment();
  const { deleteAppointment, isLoading: isDeletingLoading } = useDeleteAppointment();
  const { invalidateQueries } = useAppointmentCacheInvalidation();

  // Combine loading states
  const isLoading = isCompletingLoading || isCancelingLoading || isReschedulingLoading || isDeletingLoading;

  return {
    isLoading,
    completeAppointment,
    cancelAppointment,
    rescheduleAppointment,
    deleteAppointment,
    invalidateQueries
  };
};
