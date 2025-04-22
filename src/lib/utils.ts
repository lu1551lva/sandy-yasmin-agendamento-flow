
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isAfter, isBefore, isEqual, parse, addMinutes, set } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Brazilian holidays for 2025 (can be expanded)
export const HOLIDAYS_2025 = [
  "2025-01-01", // Ano Novo
  "2025-03-03", // Carnaval
  "2025-03-04", // Carnaval
  "2025-04-18", // Sexta-feira Santa
  "2025-04-21", // Tiradentes
  "2025-05-01", // Dia do Trabalho
  "2025-06-19", // Corpus Christi
  "2025-09-07", // Independência
  "2025-10-12", // Nossa Senhora Aparecida
  "2025-11-02", // Finados
  "2025-11-15", // Proclamação da República
  "2025-12-25", // Natal
];

// Working hours
export const WORKING_HOURS = {
  weekdays: { start: "09:00", end: "18:00" },
  saturday: { start: "09:00", end: "15:00" },
  sunday: { start: null, end: null } // Closed
};

// Working days
export const WORKING_DAYS = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

// Get day of week in Portuguese
export function getDayOfWeek(date: Date): string {
  const days = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  return days[date.getDay()];
}

// Check if date is a holiday
export function isHoliday(date: Date): boolean {
  const dateStr = format(date, "yyyy-MM-dd");
  return HOLIDAYS_2025.includes(dateStr);
}

// Check if time is within working hours
export function isWithinWorkingHours(date: Date, day: string): boolean {
  const time = format(date, "HH:mm");
  
  let start, end;
  
  if (day === "sabado") {
    start = WORKING_HOURS.saturday.start;
    end = WORKING_HOURS.saturday.end;
  } else if (day === "domingo") {
    return false; // Closed on Sundays
  } else {
    start = WORKING_HOURS.weekdays.start;
    end = WORKING_HOURS.weekdays.end;
  }
  
  if (!start || !end) return false;
  
  const timeDate = parse(time, "HH:mm", new Date());
  const startDate = parse(start, "HH:mm", new Date());
  const endDate = parse(end, "HH:mm", new Date());
  
  return (isAfter(timeDate, startDate) || isEqual(timeDate, startDate)) && 
         (isBefore(timeDate, endDate) || isEqual(timeDate, endDate));
}

// Generate time slots with 30 minute intervals
export function generateTimeSlots(date: Date, serviceMinutes = 30): string[] {
  const day = getDayOfWeek(date);
  
  // Check if it's a working day
  if (!WORKING_DAYS.includes(day)) return [];
  
  // Check if it's a holiday
  if (isHoliday(date)) return [];
  
  let startTime, endTime;
  
  if (day === "sabado") {
    startTime = parse(WORKING_HOURS.saturday.start!, "HH:mm", date);
    endTime = parse(WORKING_HOURS.saturday.end!, "HH:mm", date);
  } else {
    startTime = parse(WORKING_HOURS.weekdays.start, "HH:mm", date);
    endTime = parse(WORKING_HOURS.weekdays.end, "HH:mm", date);
  }
  
  const slots: string[] = [];
  let currentTime = startTime;
  
  while (isBefore(currentTime, endTime) || isEqual(currentTime, endTime)) {
    slots.push(format(currentTime, "HH:mm"));
    currentTime = addMinutes(currentTime, 30);
  }
  
  return slots;
}

// Format date to Brazilian format
export function formatDate(date: Date | string): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return format(parsedDate, "dd/MM/yyyy", { locale: ptBR });
}

// Format currency to Brazilian format
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Format phone number (xx) xxxxx-xxxx
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format according to length
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
  }
  
  // Return original if not matching expected formats
  return phone;
}

// Validate email format
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validate phone number
export function validatePhone(phone: string): boolean {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // Check if it has 10 or 11 digits (with or without the 9 digit)
  return cleaned.length === 10 || cleaned.length === 11;
}

// Create WhatsApp link
export function createWhatsAppLink(phone: string, message: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // Create the URL
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
