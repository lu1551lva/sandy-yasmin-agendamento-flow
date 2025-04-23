import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, Service } from "@/lib/supabase";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateTimeSlots } from "@/lib/dateUtils";

export function useDateSelectionData(selectedService: Service | null, selectedDate: Date | null, professionalId: string | null) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const oneMonthLater = addDays(today, 30);

  // Query appointments for the selected date
  const { data: appointments, refetch: refetchAppointments } = useQuery({
    queryKey: ["appointments", selectedDate, professionalId],
    queryFn: async () => {
      if (!selectedDate || !professionalId) return [];
      setLoading(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("data", dateStr)
        .eq("profissional_id", professionalId)
        .neq("status", "cancelado");
      setLoading(false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedDate && !!professionalId,
  });

  // Query professional to check available days
  const { data: professional } = useQuery({
    queryKey: ["professional", professionalId],
    queryFn: async () => {
      if (!professionalId) return null;
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .eq("id", professionalId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!professionalId,
  });

  // Update available time slots when date changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      const baseSlots = generateTimeSlots(selectedDate, selectedService.duracao_em_minutos, true);
      const bookedTimes = appointments?.map(app => app.hora) || [];
      const availableTimes = baseSlots.filter(time => !bookedTimes.includes(time));
      setAvailableTimeSlots(availableTimes);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, appointments, selectedService]);

  // Disable past, future, or invalid dates
  const isDateDisabled = useCallback(
    (date: Date) => {
      if (isBefore(date, startOfDay(today)) || isBefore(oneMonthLater, date)) return true;
      if (professional && professional.dias_atendimento) {
        const diaSemana = format(date, "EEEE", { locale: ptBR });
        const mapDias: Record<string, string> = {
          domingo: "domingo",
          "segunda-feira": "segunda",
          "terça-feira": "terca",
          "quarta-feira": "quarta",
          "quinta-feira": "quinta",
          "sexta-feira": "sexta",
          sábado: "sabado"
        };
        const diaFormatado = mapDias[diaSemana];
        if (!professional.dias_atendimento.includes(diaFormatado)) return true;
      }
      return false;
    },
    [today, oneMonthLater, professional]
  );

  return {
    availableTimeSlots,
    loading,
    appointments,
    professional,
    isDateDisabled,
    refetchAppointments,
  };
}
