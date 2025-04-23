
// Create WhatsApp link
export const createWhatsAppLink = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

// Format WhatsApp message template with appointment data
export const formatWhatsAppTemplate = (
  template: string,
  data: { nome?: string; servico?: string; data?: string; hora?: string; valor?: string }
) => {
  let formattedMessage = template;
  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      const regex = new RegExp(`{${key}}`, "g");
      formattedMessage = formattedMessage.replace(regex, value);
    }
  });
  return formattedMessage;
};

// Get WhatsApp templates from localStorage
export const getWhatsAppTemplates = () => {
  const defaultTemplates = {
    confirmation: `Olá {nome}! Confirmamos seu agendamento no Studio Sandy Yasmin para {servico} no dia {data} às {hora}. Valor: {valor}. Aguardamos sua presença!`,
    reminder: `Olá {nome}! Passando para lembrar do seu agendamento amanhã às {hora} para {servico}. Caso precise remarcar, entre em contato conosco. Obrigado!`,
    reschedule: `Olá {nome}! Precisamos remarcar seu agendamento para {servico} que está marcado para {data} às {hora}. Por favor, entre em contato conosco para agendar uma nova data e horário. Agradecemos a compreensão!`,
    cancellation: `Olá {nome}! Lamentamos informar que precisamos cancelar seu agendamento para {servico} no dia {data} às {hora}. Por favor, entre em contato conosco para mais informações. Pedimos desculpas pelo inconveniente.`,
    followup: `Olá {nome}! Como foi sua experiência com o serviço {servico} no Studio Sandy Yasmin? Ficaríamos felizes em receber seu feedback. Obrigado pela preferência!`
  };
  const savedTemplates = localStorage.getItem('whatsappTemplates');
  return savedTemplates ? JSON.parse(savedTemplates) : defaultTemplates;
};
