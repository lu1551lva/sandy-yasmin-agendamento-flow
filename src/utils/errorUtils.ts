
/**
 * Utilitário para tratar e logar erros de forma consistente
 */

// Função para logar erros no console com formatação melhorada
export function logError(
  context: string, 
  error: unknown, 
  additionalInfo?: Record<string, any>
): void {
  console.error(`❌ Erro em ${context}:`, error);
  
  if (additionalInfo) {
    console.error(`ℹ️ Informações adicionais:`, additionalInfo);
  }
  
  // Se for um erro com stack trace, exibir o stack
  if (error instanceof Error && error.stack) {
    console.error(`📚 Stack trace:`, error.stack);
  }
}

// Função para logar erros de agendamento
export function logAppointmentError(
  action: string,
  appointmentId: string | null | undefined,
  error: unknown
): void {
  logError(`Agendamento (${action})`, error, {
    appointmentId: appointmentId || 'não informado',
    timestamp: new Date().toISOString()
  });
}

// Função para logar operações de banco de dados
export function logDatabaseOperation(
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'RPC',
  table: string,
  result: { data?: any; error?: any; success?: boolean }
): void {
  if (result.error) {
    console.error(`❌ Erro em operação ${operation} na tabela ${table}:`, result.error);
  } else {
    console.log(`✅ Operação ${operation} na tabela ${table} concluída com sucesso.`, {
      affectedRows: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0)
    });
  }
}

// Função para obter mensagem de erro amigável
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Tratar erros comuns e dar mensagens mais amigáveis
    if (error.message.includes('foreign key constraint')) {
      return 'Este registro está sendo usado em outro lugar e não pode ser excluído.';
    }
    
    if (error.message.includes('timeout')) {
      return 'A operação demorou muito tempo. Verifique sua conexão e tente novamente.';
    }
    
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
