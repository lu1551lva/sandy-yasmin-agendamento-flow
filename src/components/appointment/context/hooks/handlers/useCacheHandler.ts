

import { useCallback } from "react";
import { useAppointmentCache } from "@/hooks/appointment/useAppointmentCache";
import { logUIEvent } from "@/utils/debugUtils";

interface UseCacheHandlerProps {
  onAppointmentUpdated: () => void;
}

export function useCacheHandler({
  onAppointmentUpdated
}: UseCacheHandlerProps) {
  const { forceRefetchAll } = useAppointmentCache();

  // Helper function to handle when an appointment is updated
  const handleAppointmentUpdated = useCallback(() => {
    logUIEvent('Appointment updated, refreshing data...');
    forceRefetchAll().then(() => {
      onAppointmentUpdated();
    });
  }, [onAppointmentUpdated, forceRefetchAll]);

  return {
    handleAppointmentUpdated
  };
}

