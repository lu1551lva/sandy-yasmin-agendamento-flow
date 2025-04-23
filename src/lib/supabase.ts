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
export type Professional = Tables['profissionais']['Row'] & { salao_id?: string };
export type Service = Tables['servicos']['Row'];
export type Appointment = Tables['agendamentos']['Row'];

export type AppointmentWithDetails = Appointment & {
  cliente: Client;
  servico: Service;
  profissional: Professional;
};
