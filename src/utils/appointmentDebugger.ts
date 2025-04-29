
/**
 * Arquivo específico para depuração avançada de problemas em agendamentos
 * Pode ser usado para verificações mais completas de consistência
 */

import { supabase } from "@/lib/supabase";
import { AppointmentWithDetails } from "@/types/appointment.types";

/**
 * Verifica a consistência entre o agendamento e seu histórico
 */
export const verifyAppointmentConsistency = async (appointmentId: string) => {
  try {
    console.log(`[DEBUG] Verificando consistência do agendamento ${appointmentId}...`);
    
    // Fetch appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', appointmentId)
      .single();
    
    if (appointmentError || !appointment) {
      console.error('[DEBUG] Erro ao buscar agendamento:', appointmentError || 'Não encontrado');
      return { success: false, error: appointmentError?.message || 'Agendamento não encontrado' };
    }
    
    // Fetch history
    const { data: history, error: historyError } = await supabase
      .from('agendamento_historico')
      .select('*')
      .eq('agendamento_id', appointmentId)
      .order('created_at', { ascending: false });
    
    if (historyError) {
      console.error('[DEBUG] Erro ao buscar histórico:', historyError);
      return { success: false, error: historyError.message };
    }
    
    // Compare status
    const latestStatus = history && history.length > 0 ? history[0].tipo : null;
    const isConsistent = latestStatus === appointment.status;
    
    console.log('[DEBUG] Verificação de consistência:', { 
      appointmentId,
      appointmentStatus: appointment.status, 
      latestHistoryStatus: latestStatus,
      isConsistent,
      historyCount: history?.length || 0
    });
    
    return { 
      success: true, 
      isConsistent,
      appointment,
      history,
      details: {
        appointmentStatus: appointment.status,
        latestHistoryStatus: latestStatus,
        historyCount: history?.length || 0,
        motivo_cancelamento: appointment.motivo_cancelamento
      }
    };
    
  } catch (error) {
    console.error('[DEBUG] Erro ao verificar consistência:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Faz um diagnóstico completo do agendamento e seu ciclo de vida
 */
export const diagnoseAppointment = async (appointmentId: string) => {
  try {
    console.log(`[DIAGNÓSTICO] Iniciando diagnóstico completo do agendamento ${appointmentId}...`);
    
    // Busca dados completos do agendamento
    const { data: fullAppointment, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        cliente:clientes(*),
        servico:servicos(*),
        profissional:profissionais(*)
      `)
      .eq('id', appointmentId)
      .single();
      
    if (error || !fullAppointment) {
      console.error('[DIAGNÓSTICO] Agendamento não encontrado:', error || 'Dados vazios');
      return { success: false, error: error?.message || 'Agendamento não encontrado' };
    }
    
    // Busca histórico completo
    const { data: history } = await supabase
      .from('agendamento_historico')
      .select('*')
      .eq('agendamento_id', appointmentId)
      .order('created_at', { ascending: true });
      
    // Análise do ciclo de vida
    const lifecycle = analyzeLifecycle(fullAppointment as AppointmentWithDetails, history || []);
    
    console.log('[DIAGNÓSTICO] Resultado:', {
      appointmentId,
      status: fullAppointment.status,
      statusConsistent: lifecycle.isStatusConsistent,
      historyCount: history?.length || 0,
      fullDiagnosis: lifecycle
    });
    
    return {
      success: true,
      appointment: fullAppointment,
      history: history || [],
      lifecycle
    };
    
  } catch (error) {
    console.error('[DIAGNÓSTICO] Erro durante diagnóstico:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Analisa o ciclo de vida de um agendamento com base no histórico
 */
const analyzeLifecycle = (appointment: AppointmentWithDetails, history: any[]) => {
  // Status atual
  const currentStatus = appointment.status;
  
  // Status no histórico
  const statusChanges = history.map(h => ({ 
    status: h.tipo, 
    timestamp: h.created_at,
    description: h.descricao
  }));
  
  // Último status no histórico
  const latestHistoryStatus = statusChanges.length > 0 
    ? statusChanges[statusChanges.length - 1].status 
    : null;
  
  // Verifica consistência
  const isStatusConsistent = latestHistoryStatus === currentStatus;
  
  return {
    appointmentId: appointment.id,
    currentStatus,
    latestHistoryStatus,
    isStatusConsistent,
    statusChanges,
    historyCount: history.length,
    clienteInfo: {
      id: appointment.cliente?.id,
      nome: appointment.cliente?.nome
    },
    profissionalInfo: {
      id: appointment.profissional?.id,
      nome: appointment.profissional?.nome
    },
    servicoInfo: {
      id: appointment.servico?.id,
      nome: appointment.servico?.nome
    },
    dataHora: `${appointment.data} ${appointment.hora}`,
    motivoCancelamento: appointment.motivo_cancelamento
  };
};

/**
 * Função para expor no console global para debug
 */
export const setupAppointmentDebugger = () => {
  // @ts-ignore - Adiciona ao objeto window para acesso via console
  window.appointmentDebugger = {
    verifyAppointmentConsistency,
    diagnoseAppointment,
    async checkAll() {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('id, status')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) {
        console.error('Erro ao listar agendamentos:', error);
        return;
      }
      
      console.log(`Verificando consistência de ${data.length} agendamentos...`);
      
      const results = [];
      for (const app of data) {
        const result = await verifyAppointmentConsistency(app.id);
        results.push({
          id: app.id,
          status: app.status,
          consistent: result.isConsistent,
          details: result.details
        });
      }
      
      console.log('Resultados da verificação:', results);
      return results;
    }
  };
  
  console.log('Debugger de agendamentos disponível no console como: appointmentDebugger');
  
  // Exemplos de uso
  console.log(`
    Exemplos de uso:
    - appointmentDebugger.verifyAppointmentConsistency("ID_DO_AGENDAMENTO")
    - appointmentDebugger.diagnoseAppointment("ID_DO_AGENDAMENTO") 
    - appointmentDebugger.checkAll()
  `);
};

// Inicializa o debugger quando este arquivo for importado
if (typeof window !== 'undefined') {
  setTimeout(() => {
    setupAppointmentDebugger();
  }, 1000);
}
