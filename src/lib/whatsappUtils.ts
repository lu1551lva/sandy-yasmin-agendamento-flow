
import { formatPhoneNumber, formatPhoneForWhatsApp } from "./phoneUtils";

export function createWhatsAppLink(phoneNumber: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppTemplates(): Record<string, string> {
  const defaultTemplates = {
    confirmation: `Olá {nome}! Confirmamos seu agendamento no Studio Sandy Yasmin para {servico} no dia {data} às {hora}. Valor: {valor}. Aguardamos sua presença!`,
    
    reminder: `Olá {nome}! Passando para lembrar do seu agendamento amanhã às {hora} para {servico}. Caso precise remarcar, entre em contato conosco. Obrigado!`,
    
    reschedule: `Olá {nome}! Precisamos remarcar seu agendamento para {servico} que está marcado para {data} às {hora}. Por favor, entre em contato conosco para agendar uma nova data e horário. Agradecemos a compreensão!`,
    
    cancellation: `Olá {nome}! Lamentamos informar que precisamos cancelar seu agendamento para {servico} no dia {data} às {hora}. Por favor, entre em contato conosco para mais informações. Pedimos desculpas pelo inconveniente.`,
    
    followup: `Olá {nome}! Como foi sua experiência com o serviço {servico} no Studio Sandy Yasmin? Ficaríamos felizes em receber seu feedback. Obrigado pela preferência!`
  };

  const savedTemplates = localStorage.getItem('whatsappTemplates');
  return savedTemplates ? JSON.parse(savedTemplates) : defaultTemplates;
}

export function formatWhatsAppTemplate(template: string, variables: Record<string, string>): string {
  let formattedMessage = template;
  
  // Replace all variables in the template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g');
    formattedMessage = formattedMessage.replace(regex, value);
  }
  
  return formattedMessage;
}
