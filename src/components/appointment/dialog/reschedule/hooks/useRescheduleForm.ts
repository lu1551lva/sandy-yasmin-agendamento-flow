
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AppointmentWithDetails } from "@/types/appointment.types";

interface UseRescheduleFormProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
}

export function useRescheduleForm({ appointment, isOpen }: UseRescheduleFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const { toast } = useToast();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(undefined);
      setSelectedTime("");
      setNote("");
    }
  }, [isOpen]);

  // Fetch available times for the selected date and service
  const { data: availableTimesData = [] } = useQuery({
    queryKey: [
      'available-times', 
      selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'no-date', 
      appointment.servico.id,
      appointment.profissional.id
    ],
    queryFn: async () => {
      if (!selectedDate || !appointment.servico || !appointment.profissional) {
        return [];
      }
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      // Buscar agendamentos que possam conflitar (apenas os agendados)
      const { data: existingAppointments, error } = await supabase
        .from('agendamentos')
        .select('hora, id')
        .eq('data', formattedDate)
        .eq('profissional_id', appointment.profissional.id)
        .eq('status', 'agendado');
        
      if (error) {
        console.error("Erro ao buscar agendamentos existentes:", error);
        return [];
      }

      // Permitir reagendar para o mesmo horário do próprio agendamento
      const filteredAppointments = existingAppointments.filter(
        appt => appt.id !== appointment.id
      );
      
      console.log(`Encontrados ${filteredAppointments.length} agendamentos existentes para o dia ${formattedDate}`);

      // Generate available time slots
      const { horario_inicio, horario_fim } = appointment.profissional;
      const serviceDuration = appointment.servico.duracao_em_minutos;

      console.log(`Gerando horários disponíveis entre ${horario_inicio} e ${horario_fim} com duração de ${serviceDuration} minutos`);

      const [startHour, startMinute] = horario_inicio.split(':').map(Number);
      const [endHour, endMinute] = horario_fim.split(':').map(Number);

      const slots: string[] = [];
      let currentHour = startHour;
      let currentMinute = startMinute;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute <= endMinute - serviceDuration)
      ) {
        const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Check if this time slot is already booked
        const isSlotBooked = filteredAppointments.some(
          appointment => appointment.hora === timeSlot
        );

        // Only add available slots
        if (!isSlotBooked) {
          slots.push(timeSlot);
        }

        // Move to next slot based on service duration
        currentMinute += serviceDuration;
        while (currentMinute >= 60) {
          currentMinute -= 60;
          currentHour += 1;
        }
      }
      
      console.log(`Horários disponíveis: ${slots.join(', ')}`);
      return slots;
    },
    enabled: !!selectedDate && isOpen,
    staleTime: 0 // Don't cache this data
  });
  
  const validateForm = (): boolean => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione uma data e horário",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  return {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    note,
    setNote,
    availableTimesData,
    validateForm
  };
}
