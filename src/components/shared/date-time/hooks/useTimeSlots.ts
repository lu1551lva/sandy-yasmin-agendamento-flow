
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { Professional, Service } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { Block } from "@/pages/admin/blocks/types";

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

  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bloqueios")
        .select("*");

      if (error) throw error;
      return data as Block[];
    },
  });

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
      
      const dayName = format(date, 'EEEE', { locale: ptBR });
      
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
      
      if (!Array.isArray(professional.dias_atendimento)) {
        console.error("dias_atendimento não é um array:", professional.dias_atendimento);
        return [];
      }
      
      if (!professional.dias_atendimento.includes(normalizedDay)) {
        console.log("Profissional não atende neste dia");
        return [];
      }

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
      
      const formattedDate = format(date, "yyyy-MM-dd");
      
      const filteredSlots = slots.filter(time => {
        const currentDateTime = new Date(`${formattedDate}T${time}`);

        return !blocks.some(block => {
          const blockStart = new Date(block.data_inicio);
          const blockEnd = new Date(block.data_fim);

          if (block.hora_inicio && block.hora_fim) {
            const [blockStartHour, blockStartMinute] = block.hora_inicio.split(':').map(Number);
            const [blockEndHour, blockEndMinute] = block.hora_fim.split(':').map(Number);
            
            const timeHour = parseInt(time.split(':')[0]);
            const timeMinute = parseInt(time.split(':')[1]);

            return (
              currentDateTime >= blockStart &&
              currentDateTime <= blockEnd &&
              (
                (timeHour > blockStartHour || (timeHour === blockStartHour && timeMinute >= blockStartMinute)) &&
                (timeHour < blockEndHour || (timeHour === blockEndHour && timeMinute < blockEndMinute))
              )
            );
          }

          return currentDateTime >= blockStart && currentDateTime <= blockEnd;
        });
      });

      console.log(`Horários disponíveis: ${filteredSlots.join(', ')}`);
      return filteredSlots;
    };

    setAvailableTimes(generateTimeSlots());
  }, [date, professional, selectedService, appointments, blocks]);

  return availableTimes;
};
