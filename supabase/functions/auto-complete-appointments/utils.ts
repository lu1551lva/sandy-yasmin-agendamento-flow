
/**
 * Verifica se uma data e hora já passaram, considerando o fuso horário do Brasil (UTC-3)
 * @param dateStr Data no formato YYYY-MM-DD
 * @param timeStr Hora no formato HH:MM
 * @returns true se a data/hora já passou, false caso contrário
 */
export function isInPast(dateStr: string, timeStr: string): boolean {
  try {
    // Obter a data atual em UTC
    const now = new Date();
    
    // Criar uma data com a data e hora do agendamento
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Criar a data do agendamento em UTC
    // A data deve ser criada no fuso horário local do Brasil (UTC-3)
    // Para isso, subtraímos 3 horas para converter de Brasil para UTC
    // Exemplo: 15:00 no Brasil é 18:00 UTC
    const appointmentDateUTC = new Date(Date.UTC(year, month - 1, day, hours - 3, minutes, 0));
    
    console.log(`Comparando:
    - Data/hora agendamento (original): ${dateStr} ${timeStr}
    - Data/hora agendamento (UTC ajustada): ${appointmentDateUTC.toISOString()}
    - Data/hora atual (UTC): ${now.toISOString()}`);
    
    // Comparar as datas em UTC
    return now >= appointmentDateUTC;
  } catch (e) {
    console.error('Erro ao verificar se data está no passado:', e);
    return false;
  }
}
