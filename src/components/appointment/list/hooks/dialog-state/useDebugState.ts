
import { debugAppointmentState } from "@/utils/debugUtils";

/**
 * Hook for debugging appointment dialog state
 */
export function useDebugState(state: Record<string, any>) {
  const debugCurrentState = () => {
    debugAppointmentState("useAppointmentDialogsState", state);
  };

  return {
    debugCurrentState
  };
}
