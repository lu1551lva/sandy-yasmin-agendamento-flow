
/**
 * Utilitário para logging unificado na aplicação
 */

// Configuração para controlar níveis de log
const LOG_LEVELS = {
  ERROR: true,
  WARN: true,
  INFO: true,
  DEBUG: true,
  TRACE: false // logs muito detalhados, desativados por padrão
};

// Função para logar erros
export function logError(message: string, ...details: any[]): void {
  if (LOG_LEVELS.ERROR) {
    console.error(`❌ ERRO: ${message}`, ...details);
  }
}

// Função para logar avisos
export function logWarn(message: string, ...details: any[]): void {
  if (LOG_LEVELS.WARN) {
    console.warn(`⚠️ AVISO: ${message}`, ...details);
  }
}

// Função para logar informações
export function logInfo(message: string, ...details: any[]): void {
  if (LOG_LEVELS.INFO) {
    console.log(`ℹ️ INFO: ${message}`, ...details);
  }
}

// Função para logar mensagens de depuração
export function logDebug(message: string, ...details: any[]): void {
  if (LOG_LEVELS.DEBUG) {
    console.log(`🔍 DEBUG: ${message}`, ...details);
  }
}

// Função para logar mensagens de rastreamento detalhado
export function logTrace(message: string, ...details: any[]): void {
  if (LOG_LEVELS.TRACE) {
    console.log(`📋 TRACE: ${message}`, ...details);
  }
}

// Função específica para logar operações de agendamento
export function logAppointment(action: string, appointmentId: string, ...details: any[]): void {
  logInfo(`AGENDAMENTO [${action}] ${appointmentId}`, ...details);
}

// Função para logar operações de cache
export function logCache(action: string, queryKeys: string[], ...details: any[]): void {
  logDebug(`CACHE [${action}] ${queryKeys.join(', ')}`, ...details);
}

// Função para logar operações de UI
export function logUI(action: string, component: string, ...details: any[]): void {
  logTrace(`UI [${action}] ${component}`, ...details);
}

// Função para logar duração de operações
export function logTiming(label: string, startTime: number): void {
  const duration = performance.now() - startTime;
  logDebug(`TEMPO [${label}] ${duration.toFixed(2)}ms`);
}

// Função para iniciar medição de tempo
export function startTiming(label: string): () => void {
  const start = performance.now();
  return () => logTiming(label, start);
}
