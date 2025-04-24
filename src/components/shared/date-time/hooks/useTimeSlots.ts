
import { useState, useEffect } from "react";
import { format } from "date-fns";
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
      console.log("Gerando time slots para:", professional.nome);
      console.log("Dias de atendimento:", professional.dias_atendimento);
      console.log("Horário início:", professional.horario_inicio);
      console.log("Horário fim:", professional.horario_fim);
      
      // Verificar se a data selecionada é um dia de atendimento do profissional
      const dayName = format(date, 'EEEE', { locale: require('date-fns/locale/pt-BR') });
      
      // Mapeamento dos dias da semana para o formato usado no banco
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
      console.log("Dia selecionado:", dayName, "Dia normalizado:", normalizedDay);
      
      // Verificar se o array dias_atendimento existe e é um array
      if (!Array.isArray(professional.dias_atendimento)) {
        console.error("dias_atendimento não é um array:", professional.dias_atendimento);
        return [];
      }
      
      // Se o profissional não atende neste dia, retornar array vazio
      if (!professional.dias_atendimento.includes(normalizedDay)) {
        console.log("Profissional não atende neste dia");
        return [];
      }

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

    setAvailableTimes(generateTimeSlots());
  }, [date, professional, selectedService, appointments]);

  return availableTimes;
};
