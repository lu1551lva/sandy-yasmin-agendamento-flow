
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Tables = Database['public']['Tables']

export type Client = Tables['clientes']['Row']
export type Professional = Tables['profissionais']['Row']
export type Service = Tables['servicos']['Row']
export type Appointment = Tables['agendamentos']['Row']

export type AppointmentWithDetails = Appointment & {
  cliente: Client;
  servico: Service;
  profissional: Professional;
}
