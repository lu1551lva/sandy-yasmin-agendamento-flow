import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UseWeeklyAppointmentsProps {
  selectedDate: Date;
  professionalFilter: string;
}

// Retorna estado da semana, profissionais e agendamentos + funções auxiliares
export function useWeeklyAppointments({
  selectedDate,
  professionalFilter,
}: UseWeeklyAppointmentsProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0, locale: ptBR });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0, locale: ptBR });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });

  const { data: professionals } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: [
      "week-appointments",
      format(weekStart, "yyyy-MM-dd"),
      format(weekEnd, "yyyy-MM-dd"),
      professionalFilter,
    ],
    queryFn: async () => {
      let query = supabase
        .from("agendamentos")
        .select(
          `
          *,
          cliente:clientes(*),
          servico:servicos(*),
          profissional:profissionais(*)
        `
        )
        .gte("data", format(weekStart, "yyyy-MM-dd"))
        .lte("data", format(weekEnd, "yyyy-MM-dd"))
        .neq("status", "cancelado");

      if (professionalFilter !== "all") {
        query = query.eq("profissional_id", professionalFilter);
      }

      const { data, error } = await query.order("data").order("hora");

      if (error) throw error;
      return data || [];
    },
  });

  const getAppointmentsForDayAndTime = (day: Date, time: string) => {
    if (!appointments) return [];
    const formattedDay = format(day, "yyyy-MM-dd");
    return appointments.filter(
      (appointment: any) =>
        appointment.data === formattedDay && appointment.hora === time
    );
  };

  const getAppointmentsForDay = (day: Date) => {
    if (!appointments) return [];
    const formattedDay = format(day, "yyyy-MM-dd");
    return appointments.filter(
      (appointment: any) => appointment.data === formattedDay
    );
  };

  return {
    professionals,
    appointments,
    isLoading,
    weekStart,
    weekEnd,
    weekDays,
    timeSlots,
    getAppointmentsForDayAndTime,
    getAppointmentsForDay,
  };
}
