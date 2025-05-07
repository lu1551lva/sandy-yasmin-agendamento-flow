
import { getWhatsAppTemplates } from "@/lib/whatsappUtils";

/**
 * Hook para gerenciar templates de mensagens do WhatsApp
 */
export const useWhatsAppTemplates = () => {
  // Get the templates from local storage
  const templates = getWhatsAppTemplates();

  /**
   * Format a message template with variables
   */
  const formatMessage = (templateKey: string, variables: Record<string, string>) => {
    const template = templates[templateKey as keyof typeof templates] || "";
    
    // Replace all variables in the template
    let formattedMessage = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{${key}}`, 'g');
      formattedMessage = formattedMessage.replace(regex, value);
    }
    
    return formattedMessage;
  };

  /**
   * Gera uma mensagem de confirmação de agendamento
   */
  const getAppointmentConfirmationTemplate = (
    clientName: string,
    serviceName: string,
    formattedDateTime: string
  ) => {
    return `Olá ${clientName}! 

Seu agendamento para *${serviceName}* foi confirmado para *${formattedDateTime}*.

Agradecemos a preferência! Qualquer dúvida estamos à disposição.

Atenciosamente,
*Sandy Yasmin Studio*`;
  };

  /**
   * Gera uma mensagem de lembrete de agendamento
   */
  const getAppointmentReminderTemplate = (
    clientName: string,
    serviceName: string,
    formattedDateTime: string
  ) => {
    return `Olá ${clientName}!

Este é um lembrete do seu agendamento para *${serviceName}* amanhã, *${formattedDateTime}*.

Contamos com sua presença!

Atenciosamente,
*Sandy Yasmin Studio*`;
  };

  /**
   * Gera uma mensagem de cancelamento de agendamento
   */
  const getCancellationTemplate = (
    clientName: string,
    serviceName: string,
    formattedDateTime: string,
    reason?: string
  ) => {
    let message = `Olá ${clientName}!

Informamos que seu agendamento para *${serviceName}* em *${formattedDateTime}* foi cancelado.`;

    if (reason) {
      message += `\n\nMotivo: *${reason}*`;
    }

    message += `\n\nPara reagendar, entre em contato conosco.

Atenciosamente,
*Sandy Yasmin Studio*`;

    return message;
  };

  /**
   * Gera uma mensagem de reagendamento
   */
  const getRescheduleTemplate = (
    clientName: string,
    serviceName: string,
    oldDateTime: string,
    newDateTime: string
  ) => {
    return `Olá ${clientName}!

Seu agendamento para *${serviceName}* foi reagendado:

De: *${oldDateTime}*
Para: *${newDateTime}*

Qualquer dúvida, estamos à disposição.

Atenciosamente,
*Sandy Yasmin Studio*`;
  };

  /**
   * Gera a URL para abrir o WhatsApp com a mensagem predefinida
   */
  const getWhatsAppURL = (phone: string, message: string): string => {
    // Formata o número de telefone (remove caracteres não numéricos)
    const formattedPhone = phone.replace(/\D/g, '');
    
    // Se o número não começar com 55 (código do Brasil), adiciona
    const fullPhone = formattedPhone.startsWith('55') 
      ? formattedPhone 
      : `55${formattedPhone}`;
    
    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Retorna a URL completa do WhatsApp
    return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
  };

  return {
    templates,
    formatMessage,
    getAppointmentConfirmationTemplate,
    getAppointmentReminderTemplate,
    getCancellationTemplate,
    getRescheduleTemplate,
    getWhatsAppURL
  };
};
