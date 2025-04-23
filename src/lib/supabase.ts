
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

export type Salon = {
  id: string;
  nome: string;
  email: string;
  url_personalizado: string;
  telefone?: string | null;
  plano: 'trial' | 'ativo' | 'inativo';
  trial_expira_em?: string | null;
};

export type Client = Tables['clientes']['Row'];
export type Professional = Tables['profissionais']['Row'] & { salao_id?: string };
export type Service = Tables['servicos']['Row'];
export type Appointment = Tables['agendamentos']['Row'];

export type AppointmentWithDetails = Appointment & {
  cliente: Client;
  servico: Service;
  profissional: Professional;
  salao?: Salon;
};

export const DEFAULT_SALON_LOGO = "https://placehold.co/400x400/FFEFEF/D0A638?text=S";

// Helper function to get salon by URL slug
export async function getSalonBySlug(slug: string): Promise<Salon | null> {
  if (!slug) return null;
  
  const { data, error } = await supabase
    .from('saloes')
    .select('*')
    .eq('url_personalizado', slug)
    .single();
  
  if (error || !data) return null;
  return data;
}

// Check if a salon's trial has expired
export function hasTrialExpired(salon: Salon | null): boolean {
  if (!salon) return true;
  if (salon.plano !== 'trial') return false;
  
  const today = new Date();
  const trialEndDate = salon.trial_expira_em ? new Date(salon.trial_expira_em) : null;
  
  if (!trialEndDate) return false;
  return today > trialEndDate;
}

// Check if a salon is active (either in valid trial or active status)
export function isSalonActive(salon: Salon | null): boolean {
  if (!salon) return false;
  
  if (salon.plano === 'ativo') return true;
  if (salon.plano === 'trial' && !hasTrialExpired(salon)) return true;
  
  return false;
}
