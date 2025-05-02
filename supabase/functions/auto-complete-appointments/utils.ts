
/**
 * Verifica se uma data e hora já passaram, considerando o fuso horário do Brasil (UTC-3)
 * @param dateStr Data no formato YYYY-MM-DD
 * @param timeStr Hora no formato HH:MM
 * @returns true se a data/hora já passou, false caso contrário
 */
export function isInPast(dateStr: string, timeStr: string): boolean {
  // Obter a data atual considerando o fuso horário do Brasil (UTC-3)
  const now = new Date();
  
  // O Brasil está em UTC-3, então adicionamos 3 horas para comparar com UTC
  // Isso é necessário porque estamos comparando a data/hora do agendamento 
  // (que está em UTC para o banco de dados) com a data/hora atual do servidor (também em UTC)
  // Assim, se no Brasil são 13:00, no UTC são 16:00
  const brazilOffsetHours = 3; // UTC-3
  
  // Obter a data e hora do agendamento
  const [hours, minutes] = timeStr.split(':').map(Number);
  const appointmentDate = new Date(`${dateStr}T${timeStr}:00.000Z`);
  
  // Adicionar o offset do Brasil para comparação correta
  const appointmentDateAdjusted = new Date(appointmentDate);
  appointmentDateAdjusted.setHours(appointmentDate.getHours() + brazilOffsetHours);
  
  console.log(`Comparando:
  - Data/hora agendamento (UTC): ${appointmentDate.toISOString()}
  - Data/hora agendamento (ajustada): ${appointmentDateAdjusted.toISOString()}
  - Data/hora atual (UTC): ${now.toISOString()}`);
  
  // Comparar as datas
  return now > appointmentDateAdjusted;
}
