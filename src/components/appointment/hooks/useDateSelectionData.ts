
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, Service, Professional } from "@/lib/supabase";
import { format, addDays, parseISO, isAfter, isBefore, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

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

  // Function to check if a date should be disabled - MODIFICADA PARA PERMITIR TODOS OS DIAS
  const isDateDisabled = (date: Date) => {
    // Always enable today and future dates - MANTIDO
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
    console.log(`Verificando dia ${dayName} (${normalizedDay}) para data ${date.toISOString().split('T')[0]}`);
    console.log("Dias de atendimento do profissional:", professional.dias_atendimento);
    
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
      console.log(`Data ${selectedDate.toISOString().split('T')[0]} está desativada para o profissional`);
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
}
