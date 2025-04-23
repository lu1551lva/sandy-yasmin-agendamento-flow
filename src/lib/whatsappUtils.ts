
import { formatPhoneForWhatsApp } from "./phoneUtils";

// Create WhatsApp link with phone number and message
export const createWhatsAppLink = (phone: string, message: string = "") => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}${message ? `?text=${encodedMessage}` : ''}`;
};

// Format templates with variable substitution
export const formatWhatsAppTemplate = (template: string, variables: Record<string, string>) => {
  let formattedTemplate = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    formattedTemplate = formattedTemplate.replace(regex, value);
  });
  
  return formattedTemplate;
};

// Get WhatsApp templates from local storage or return defaults
export const getWhatsAppTemplates = () => {
  const savedTemplates = localStorage.getItem('whatsappTemplates');
  
  if (savedTemplates) {
    return JSON.parse(savedTemplates);
  }
  
  // Default templates
  const defaultTemplates = {
    confirmation: "Olá {{nome}}! Seu agendamento para {{servico}} no dia {{data}} às {{hora}} foi confirmado. Obrigado por agendar conosco!",
    reminder: "Olá {{nome}}! Lembrando do seu agendamento para {{servico}} amanhã às {{hora}}. Aguardamos você!",
    cancellation: "Olá {{nome}}! Seu agendamento para {{servico}} no dia {{data}} às {{hora}} foi cancelado conforme solicitado.",
    followup: "Olá {{nome}}! Como foi o seu atendimento de {{servico}}? Ficaríamos felizes em receber seu feedback."
  };
  
  // Save default templates
  localStorage.setItem('whatsappTemplates', JSON.stringify(defaultTemplates));
  
  return defaultTemplates;
};

// Save updated templates to local storage
export const saveWhatsAppTemplates = (templates: Record<string, string>) => {
  localStorage.setItem('whatsappTemplates', JSON.stringify(templates));
};
