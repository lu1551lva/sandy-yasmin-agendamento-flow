
import { Client, Service, Professional, Appointment } from "@/lib/supabase";

export interface AppointmentWithDetails extends Appointment {
  cliente: Client;
  servico: Service;
  profissional: Professional;
}

export interface AppointmentData {
  service: Service | null;
  professional_id: string | null;
  date: Date | null;
  time: string | null;
  client: Client | null;
}

export type AppointmentStatus = "agendado" | "concluido" | "cancelado";

export type AppointmentFilter = {
  status?: AppointmentStatus | "all";
  professionalId?: string | "all";
  startDate?: string | null;
  endDate?: string | null;
  clientQuery?: string | null;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  appointments?: AppointmentWithDetails[];
}

export interface DateWithSlots {
  date: Date;
  slots: TimeSlot[];
}
