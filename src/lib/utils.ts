
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPhoneNumber, validateEmail, validatePhone } from "./phoneUtils";

// Utility function to combine class names with Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date using date-fns with pt-BR locale
export function formatDate(date: Date): string {
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

// Format currency for display
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Create WhatsApp link with message
export function createWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const whatsappPhone = cleanPhone.startsWith("55")
    ? cleanPhone
    : `55${cleanPhone}`;
  
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
}

// Format WhatsApp template message with variables
export function formatWhatsAppTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, "g"), value);
  }
  return result;
}

// Constants for styling
export const PRIMARY_COLOR = "#C59D24"; // Gold color for branding
export const ACCENT_COLOR = "#7C1D2E"; // Wine color for accents

// Helper for classnames
export const classNames = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Re-export phone utilities
export { formatPhoneNumber, validateEmail, validatePhone };

// Holiday management functions
export const getHolidays = (): string[] => {
  const holidays = localStorage.getItem("holidays");
  return holidays ? JSON.parse(holidays) : [];
};

export const addHoliday = (dateString: string): void => {
  const holidays = getHolidays();
  if (!holidays.includes(dateString)) {
    holidays.push(dateString);
    localStorage.setItem("holidays", JSON.stringify(holidays));
  }
};

export const removeHoliday = (dateString: string): void => {
  const holidays = getHolidays();
  const updatedHolidays = holidays.filter(date => date !== dateString);
  localStorage.setItem("holidays", JSON.stringify(updatedHolidays));
};

// Get WhatsApp templates
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
