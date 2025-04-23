import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// These values match your Supabase project.
const SUPABASE_URL = "https://bqzlexfnozmaqtvpbpay.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxemxleGZub3ptYXF0dnBicGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTk2ODUsImV4cCI6MjA2MDkzNTY4NX0.C8r5NK4dsQ_deXshLIQZmTvtd8ZgsZEWzF0WBxB7A4w";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Tables = Database['public']['Tables'];

export type Client = Tables['clientes']['Row'];
export type Professional = Tables['profissionais']['Row'];
export type Service = Tables['servicos']['Row'];
export type Appointment = Tables['agendamentos']['Row'];

export type AppointmentWithDetails = Appointment & {
  cliente: Client;
  servico: Service;
  profissional: Professional;
};

// Define Salon type for Studio Sandy Yasmin
export interface Salon {
  id: string;
  nome: string;
  url_personalizado?: string;
  telefone?: string;
  logo_url?: string;
  email?: string;
  data_cadastro?: string;
  status?: 'ativo' | 'inativo';
  periodo_teste?: boolean;
  fim_periodo_teste?: string;
  plano?: 'trial' | 'ativo' | 'inativo';
  trial_expira_em?: string;
}

export const DEFAULT_SALON_LOGO = "https://placehold.co/400x400/FFEFEF/D0A638?text=S";

// Helper function to format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Helper function to create WhatsApp link
export function createWhatsAppLink(phone: string, message: string): string {
  // Remove non-numeric characters from phone
  const formattedPhone = phone.replace(/\D/g, '');
  
  // Ensure it's properly formatted with country code
  const whatsappPhone = formattedPhone.startsWith('55') 
    ? formattedPhone 
    : `55${formattedPhone}`;
  
  // Create the URL
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
}

// Helper function to format WhatsApp message template with variables
export function formatWhatsAppTemplate(template: string, variables: Record<string, string>): string {
  let formattedMessage = template;
  
  // Replace all variables in the template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g');
    formattedMessage = formattedMessage.replace(regex, value);
  }
  
  return formattedMessage;
}

// Helper function to get WhatsApp templates
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

// Function to get salon by slug - simplified for Studio Sandy Yasmin
export const getSalonBySlug = async (slug: string): Promise<Salon | null> => {
  // Since we're returning to a single-tenant app, we'll create a static salon object
  return {
    id: "sandy-yasmin-id",
    nome: "Studio Sandy Yasmin",
    url_personalizado: "studio-sandy-yasmin",
    email: "admin@studio.com",
    status: "ativo",
    plano: "ativo"
  };
};
