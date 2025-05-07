
/**
 * Hook para gerenciar templates de mensagens do WhatsApp
 */
export const useWhatsAppTemplates = () => {
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
    getAppointmentConfirmationTemplate,
    getAppointmentReminderTemplate,
    getCancellationTemplate,
    getRescheduleTemplate,
    getWhatsAppURL
  };
};
