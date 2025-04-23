
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
