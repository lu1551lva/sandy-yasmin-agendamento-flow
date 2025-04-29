
/**
 * Utility functions for debugging appointment issues
 */

export const logAppointmentAction = (action: string, appointmentId: string, data?: any) => {
  console.log(`[APPOINTMENT] ${action} | ID: ${appointmentId}`, data || '');
};

export const logAppointmentError = (message: string, appointmentId: string, error?: any) => {
  console.error(`[APPOINTMENT ERROR] ${message} | ID: ${appointmentId}`, error || '');
};

export const validateAppointmentId = (appointmentId: string | null | undefined): boolean => {
  if (!appointmentId) {
    console.error("[APPOINTMENT VALIDATION] ID inválido", { appointmentId });
    return false;
  }
  return true;
};

export const traceAppointmentFlow = (step: string, appointmentId: string, data?: any) => {
  console.log(`[APPOINTMENT FLOW] ${step} | ID: ${appointmentId}`, data || '');
};
