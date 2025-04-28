
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { startOfDay, isBefore, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Block } from "@/pages/admin/blocks/types";

interface DateSelectorProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disablePastDates?: boolean; 
  disabledDates?: (date: Date) => boolean;
}

export const DateSelector = ({ 
  date, 
  onDateChange, 
  disablePastDates = false, 
  disabledDates 
}: DateSelectorProps) => {
  // Query to get blocks
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

  // Default disabled dates function that only disables past dates if disablePastDates is true
  const defaultDisabledDates = (date: Date) => {
    if (disablePastDates) {
      const today = startOfDay(new Date());
      const checkDate = startOfDay(new Date(date));
      return isBefore(checkDate, today);
    }
    return false;
  };

  // Check if a date is within a block that blocks the entire day
  const isDateBlocked = (date: Date) => {
    const checkDate = startOfDay(date);
    
    return blocks.some(block => {
      // Check if the block covers the entire day (no specific hours)
      if (!block.hora_inicio && !block.hora_fim) {
        const blockStart = startOfDay(new Date(block.data_inicio));
        const blockEnd = startOfDay(new Date(block.data_fim));
        
        return isWithinInterval(checkDate, { start: blockStart, end: blockEnd });
      }
      
      return false;
    });
  };

  // Combine custom disabled function with default and blocks
  const isDateDisabled = (date: Date) => {
    return defaultDisabledDates(date) || 
           isDateBlocked(date) || 
           (disabledDates ? disabledDates(date) : false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione a data desejada:</CardTitle>
        <CardDescription>Escolha um dia para o agendamento.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={isDateDisabled}
          locale={ptBR}
          className="pointer-events-auto"
        />
      </CardContent>
    </Card>
  );
};
