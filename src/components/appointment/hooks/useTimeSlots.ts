
import { useState, useEffect } from "react";
import { format, addMinutes, isWithinInterval } from "date-fns";
import { Professional, Service } from "@/lib/supabase";
import { logAppointmentError } from "@/utils/debugUtils";

interface UseTimeSlotsProps {
  date: Date | undefined;
  selectedService: Service;
  professional: Professional | undefined;
  appointments: any[];
}

export const useTimeSlots = ({
  date,
  selectedService,
  professional,
  appointments
}: UseTimeSlotsProps) => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    if (!date || !selectedService || !professional) {
      setAvailableTimes([]);
      return;
    }

    /**
     * Generates available time slots based on professional's working hours
     * and existing appointments
     */
    const generateTimeSlots = () => {
      const { horario_inicio, horario_fim } = professional;
      const serviceDuration = selectedService.duracao_em_minutos;

      console.log(`Gerando horários disponíveis entre ${horario_inicio} e ${horario_fim} com duração de ${serviceDuration} minutos`);

      // Parse start and end times
      const [startHour, startMinute] = horario_inicio.split(':').map(Number);
      const [endHour, endMinute] = horario_fim.split(':').map(Number);

      // Generate time slots
      const slots: string[] = [];
      let currentHour = startHour;
      let currentMinute = startMinute;

      // Continue until we reach the end time
      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute <= endMinute - serviceDuration)
      ) {
        // Format current time as HH:MM
        const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Check if this time is already booked
        const isSlotBooked = appointments?.some(
          (appointment) => appointment.hora === timeSlot
        );

        // If not booked, add to available slots
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
    };

    try {
      setAvailableTimes(generateTimeSlots());
    } catch (error) {
      logAppointmentError("Erro ao gerar horários disponíveis", "time-slots", error);
      setAvailableTimes([]);
    }
  }, [date, professional, selectedService, appointments]);

  return availableTimes;
};
