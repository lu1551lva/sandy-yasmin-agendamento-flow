
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { AppointmentWithDetails } from "@/types/appointment.types";

export function useWhatsAppMessages(selectedDate: Date) {
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["appointments-for-whatsapp", formattedDate],
    queryFn: async () => {
      try {
        console.log(`🔍 Buscando agendamentos para mensagens WhatsApp na data: ${formattedDate}`);
        
        const { data, error } = await supabase
          .from("agendamentos")
          .select(`
            *,
            cliente:clientes(*),
            servico:servicos(*),
            profissional:profissionais(*)
          `)
          .eq("data", formattedDate)
          .eq("status", "agendado")
          .order("hora");
          
        if (error) {
          console.error("❌ Erro ao buscar agendamentos:", error);
          throw error;
        }
        
        console.log(`✅ ${data?.length || 0} agendamentos encontrados para envio de mensagens`);
        return data as AppointmentWithDetails[];
      } catch (err) {
        console.error("Erro ao buscar agendamentos para WhatsApp:", err);
        throw err;
      }
    }
  });

  // Filter appointments by date
  const filterByDate = (date: Date) => {
    const formattedFilterDate = format(date, "yyyy-MM-dd");
    return appointments.filter(app => app.data === formattedFilterDate);
  };

  return {
    appointments,
    isLoading,
    isError,
    refetch,
    filterByDate
  };
}
