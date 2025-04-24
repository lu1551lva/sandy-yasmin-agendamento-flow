
import { useState, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import { Professional, Service } from "@/lib/supabase";

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

    const generateTimeSlots = () => {
      const { horario_inicio, horario_fim } = professional;
      const serviceDuration = selectedService.duracao_em_minutos;

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
        
        const isSlotBooked = appointments?.some(
          (appointment) => appointment.hora === timeSlot
        );

        if (!isSlotBooked) {
          slots.push(timeSlot);
        }

        currentMinute += serviceDuration;
        while (currentMinute >= 60) {
          currentMinute -= 60;
          currentHour += 1;
        }
      }
      
      console.log(`Horários disponíveis: ${slots.join(', ')}`);
      return slots;
    };

    setAvailableTimes(generateTimeSlots());
  }, [date, professional, selectedService, appointments]);

  return availableTimes;
};
