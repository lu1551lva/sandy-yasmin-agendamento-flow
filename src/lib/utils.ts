
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isWeekend, isToday as isTodayFn } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format Brazilian currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Format date to Brazilian format (day/month/year)
export const formatDate = (date: Date) => {
  return format(date, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
};

// Check if a date is a holiday
export const isHoliday = (date: Date) => {
  // Example fixed holidays
  const fixedHolidays = [
    "01-01", // Ano Novo
    "04-21", // Tiradentes
    "05-01", // Dia do Trabalho
    "09-07", // Independência
    "10-12", // Nossa Senhora Aparecida
    "11-02", // Finados
    "11-15", // Proclamação da República
    "12-25", // Natal
  ];

  const monthDay = format(date, "MM-dd");
  
  return fixedHolidays.includes(monthDay);
};

// Generate available time slots
export const generateTimeSlots = (date: Date, serviceDuration: number) => {
  // If weekend or holiday, no slots available
  if (isWeekend(date) || isHoliday(date)) {
    return [];
  }

  // Business hours (9:00 - 18:00)
  const startHour = 9;
  const endHour = 18;
  
  // Slot interval in minutes
  const slotInterval = 30;
  
  // Calculate number of slots
  const totalMinutes = (endHour - startHour) * 60;
  const totalSlots = Math.floor(totalMinutes / slotInterval);
  
  // Generate slots
  const slots = [];
  for (let i = 0; i < totalSlots; i++) {
    const minutes = i * slotInterval;
    const hour = Math.floor(minutes / 60) + startHour;
    const minute = minutes % 60;
    
    const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    slots.push(timeSlot);
  }
  
  return slots;
};

// Format phone number to (00) 00000-0000
export const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  
  // Remove all non-numeric characters
  const phoneNumber = value.replace(/\D/g, "");
  
  // Apply mask based on length
  if (phoneNumber.length <= 2) {
    return `(${phoneNumber}`;
  }
  if (phoneNumber.length <= 7) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  }
  if (phoneNumber.length <= 11) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
  }
  
  // Truncate if longer than 11 digits
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

// Validate email format
export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone format
export const validatePhone = (phone: string) => {
  // Accept formats like: (00) 00000-0000 or partially filled
  const re = /^\(\d{2}\) \d{4,5}-\d{0,4}$|^\(\d{2}\) \d{0,5}$|^\(\d{0,2}\)$|^\(\d{0,2}$/;
  return re.test(phone);
};

// Create WhatsApp link
export const createWhatsAppLink = (phone: string, message: string) => {
  // Remove formatting from phone number
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Prepend Brazilian country code if not already present
  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

// Format WhatsApp message template with appointment data
export const formatWhatsAppTemplate = (
  template: string,
  data: {
    nome?: string;
    servico?: string;
    data?: string;
    hora?: string;
    valor?: string;
  }
) => {
  let formattedMessage = template;
  
  // Replace all variables with their values
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
