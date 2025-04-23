
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, Service, Professional } from "@/lib/supabase";
import { format, addDays, parseISO, isAfter, isBefore, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export function useDateSelectionData(
  selectedService: Service | null,
  selectedDate: Date | null,
  professionalId: string | null,
  salonId?: string // Added salonId parameter
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

      let query = supabase.from("profissionais").select("*").eq("id", professionalId);
      
      // If we have a salon ID, filter by it
      if (salonId) {
        query = query.eq("salao_id", salonId);
      }
      
      const { data, error } = await query.single();
      
      if (error) throw error;
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

      let query = supabase
        .from("agendamentos")
        .select("*")
        .eq("profissional_id", professionalId)
        .eq("data", format(selectedDate, "yyyy-MM-dd"))
        .neq("status", "cancelado");

      // If we have a salon ID, filter by it
      if (salonId) {
        query = query.eq("salao_id", salonId);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!professionalId && !!selectedDate
  });

  // Function to check if a date should be disabled
  const isDateDisabled = (date: Date) => {
    // Always enable today and future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isBefore(date, today)) return true;

    // If no professional is selected, don't disable any dates
    if (!professional) return false;

    // Get day name in Portuguese
    const dayName = format(date, "EEEE", { locale: ptBR });
    
    // Convert dayName to match dias_atendimento format
    const dayMap: { [key: string]: string } = {
      'domingo': 'domingo',
      'segunda-feira': 'segunda', 
      'terça-feira': 'terca',
      'quarta-feira': 'quarta',
      'quinta-feira': 'quinta',
      'sexta-feira': 'sexta',
      'sábado': 'sabado'
    };
    
    const normalizedDay = dayMap[dayName];
    
    // Check if professional works on this day
    const isWorkDay = professional.dias_atendimento.includes(normalizedDay);
    return !isWorkDay;
  };

  // Generate available time slots for the selected date
  useEffect(() => {
    if (!selectedDate || !professional || !selectedService) {
      setAvailableTimeSlots([]);
      return;
    }

    // Check if the professional works on the selected date
    if (isDateDisabled(selectedDate)) {
      setAvailableTimeSlots([]);
      return;
    }

    // Generate time slots based on the professional's working hours
    const generateTimeSlots = () => {
      const { horario_inicio, horario_fim } = professional;
      const serviceDuration = selectedService.duracao_em_minutos;

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

      return slots;
    };

    setAvailableTimeSlots(generateTimeSlots());
  }, [selectedDate, professional, selectedService, appointments]);

  // Handle errors
  useEffect(() => {
    if (professionalError) {
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
}
