
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

/**
 * Função adicional para debug detalhado de valores de state
 */
export const debugAppointmentState = (component: string, state: any) => {
  console.log(`[APPOINTMENT STATE] ${component}:`, state);
};

/**
 * Função para mostrar o stacktrace atual
 */
export const logStackTrace = (message: string) => {
  console.log(`[STACK TRACE] ${message}`);
  console.trace();
};

/**
 * Função para log de eventos de UI relacionados a agendamentos
 */
export const logUIEvent = (event: string, details?: any) => {
  console.log(`[UI EVENT] ${event}`, details || '');
};

/**
 * Função para debug de operações do Supabase
 */
export const logDatabaseOperation = (operation: string, table: string, result: any) => {
  if (result.error) {
    console.error(`[DATABASE ERROR] ${operation} em ${table}:`, result.error);
  } else {
    console.log(`[DATABASE SUCCESS] ${operation} em ${table}:`, { 
      data: result.data, 
      status: result.status,
      count: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0)
    });
  }
};

/**
 * Função para debug de diálogos de agendamento
 */
export const logDialogState = (dialog: string, isOpen: boolean, data?: any) => {
  console.log(`[DIALOG STATE] ${dialog}: ${isOpen ? 'Aberto' : 'Fechado'}`, data || '');
};

/**
 * Função para verificar a consistência dos IDs entre componentes
 */
export const verifyIdConsistency = (componentName: string, expectedId: string | null, actualId: string | null) => {
  const isConsistent = expectedId === actualId;
  const logFn = isConsistent ? console.log : console.error;
  
  logFn(`[ID CONSISTENCY] ${componentName}: ${isConsistent ? 'OK' : 'FALHA'}`, {
    expected: expectedId,
    actual: actualId
  });
  
  return isConsistent;
};
