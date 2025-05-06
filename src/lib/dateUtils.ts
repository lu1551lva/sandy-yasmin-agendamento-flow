
import { format, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Verifica se uma data e hora já passaram com referência a agora
 * @param dateStr Data no formato YYYY-MM-DD
 * @param timeStr Hora no formato HH:MM
 * @returns true se a data/hora já passou, false caso contrário
 */
export function isInPast(dateStr: string, timeStr: string): boolean {
  try {
    // Obter a data atual
    const now = new Date();
    
    // Criar uma data com a data e hora do agendamento no fuso horário local
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const appointmentDate = new Date(year, month - 1, day, hours, minutes);
    
    // Comparar diretamente usando o fuso horário local
    return now > appointmentDate;
  } catch (e) {
    console.error('Erro ao verificar se data está no passado:', e);
    return false;
  }
}

/**
 * Formata uma data para exibição em português
 * @param date Data como string ou objeto Date
 * @param formatStr Formato desejado (padrão: dd 'de' MMMM 'de' yyyy)
 * @returns String formatada
 */
export function formatDate(
  date: string | Date | null | undefined, 
  formatStr: string = "dd 'de' MMMM 'de' yyyy"
): string {
  if (!date) return 'Data inválida';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: ptBR });
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return 'Data inválida';
  }
}

/**
 * Formata data e hora para exibição em português
 * @param date Data como string ou objeto Date
 * @param time String de hora no formato HH:MM
 * @returns String formatada como "dia de mês de ano às HH:MM"
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  time: string | null | undefined
): string {
  if (!date || !time) return 'Data/hora inválida';
  
  try {
    const formattedDate = formatDate(date);
    return `${formattedDate} às ${time}`;
  } catch (e) {
    console.error('Erro ao formatar data e hora:', e);
    return 'Data/hora inválida';
  }
}
