
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, Service, Professional } from "@/lib/supabase";
import { format, addDays, parseISO, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { getHolidays } from "@/lib/utils";

export function useDateSelectionData(
  selectedService: Service | null,
  selectedDate: Date | null,
  professionalId: string | null
) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch professional data
  const {
    data: professional,
    isLoading: loadingProfessional,
    error: professionalError
  } = useQuery({
    queryKey: ["professional", professionalId],
    queryFn: async () => {
      if (!professionalId) return null;

      console.log("Buscando profissional com ID:", professionalId);
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .eq("id", professionalId)
        .single();
      
      if (error) {
        console.error("Erro ao buscar profissional:", error);
        throw error;
      }
      console.log("Profissional encontrado:", data);
      return data as Professional;
    },
    enabled: !!professionalId
  });

  // Fetch appointments for this professional on the selected date
  const {
    data: appointments,
    isLoading: loadingAppointments,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ["appointments-date", professionalId, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!professionalId || !selectedDate) return [];

      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("profissional_id", professionalId)
        .eq("data", format(selectedDate, "yyyy-MM-dd"))
        .neq("status", "cancelado");

      if (error) throw error;
      return data || [];
    },
    enabled: !!professionalId && !!selectedDate
  });

  // Check if the date is a manually added holiday
  const isHoliday = (date: Date) => {
    if (!date) return false;
    
    const holidays = getHolidays();
    const dateString = format(date, "yyyy-MM-dd");
    return holidays.includes(dateString);
  };

  // Function to check if a date should be disabled - only disable past dates and holidays
  const isDateDisabled = (date: Date) => {
    // Always disable past dates
    const today = startOfDay(new Date());
    const checkDate = startOfDay(new Date(date));
    if (isBefore(checkDate, today)) return true;

    // Check if it's a manually added holiday
    if (isHoliday(date)) return true;

    return false;
  };

  // Generate available time slots for the selected date
  useEffect(() => {
    if (!selectedDate || !professional || !selectedService) {
      setAvailableTimeSlots([]);
      return;
    }

    // Generate time slots based on the professional's working hours
    const generateTimeSlots = () => {
      const { horario_inicio, horario_fim } = professional;
      const serviceDuration = selectedService.duracao_em_minutos;

      console.log(`Gerando horários disponíveis entre ${horario_inicio} e ${horario_fim} com duração de ${serviceDuration} minutos`);

      // Parse start and end hours
      const [startHour, startMinute] = horario_inicio.split(':').map(Number);
      const [endHour, endMinute] = horario_fim.split(':').map(Number);

      const slots: string[] = [];
      let currentHour = startHour;
      let currentMinute = startMinute;

      // Generate slots until end time
      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute <= endMinute - serviceDuration)
      ) {
        const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Check if this slot is available (not booked)
        const isSlotBooked = appointments?.some(
          (appointment) => appointment.hora === timeSlot
        );

        if (!isSlotBooked) {
          slots.push(timeSlot);
        }

        // Increment by service duration
        currentMinute += serviceDuration;
        while (currentMinute >= 60) {
          currentMinute -= 60;
          currentHour += 1;
        }
      }
      
      console.log(`Horários disponíveis: ${slots.join(', ')}`);
      return slots;
    };

    setAvailableTimeSlots(generateTimeSlots());
  }, [selectedDate, professional, selectedService, appointments]);

  // Handle errors
  useEffect(() => {
    if (professionalError) {
      console.error("Erro ao carregar profissional:", professionalError);
      toast({
        title: "Erro ao carregar profissional",
        description: "Não foi possível carregar os dados do profissional",
        variant: "destructive",
      });
    }
  }, [professionalError, toast]);

  return {
    professional,
    availableTimeSlots,
    loading: loadingProfessional || loadingAppointments,
    isDateDisabled,
    refetchAppointments,
  };
};
