
/**
 * Verifica se uma data e hora já passaram, considerando o fuso horário do Brasil (UTC-3)
 * @param dateStr Data no formato YYYY-MM-DD
 * @param timeStr Hora no formato HH:MM
 * @returns true se a data/hora já passou, false caso contrário
 */
export function isInPast(dateStr: string, timeStr: string): boolean {
  // Obter a data atual em UTC
  const now = new Date();
  
  // Criar uma data com a data e hora do agendamento
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Criar a data do agendamento em UTC
  const appointmentDateUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  
  // Ajustar para o fuso horário do Brasil (UTC-3)
  // Para comparação correta, adicionamos 3 horas à data do agendamento
  // já que o horário armazenado é local (Brasil) mas estamos comparando em UTC
  const brazilOffsetHours = 3;
  appointmentDateUTC.setUTCHours(appointmentDateUTC.getUTCHours() + brazilOffsetHours);
  
  console.log(`Comparando:
  - Data/hora agendamento (original): ${dateStr} ${timeStr}
  - Data/hora agendamento (UTC ajustada): ${appointmentDateUTC.toISOString()}
  - Data/hora atual (UTC): ${now.toISOString()}`);
  
  // Comparar as datas em UTC
  return now >= appointmentDateUTC;
}
