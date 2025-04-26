
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { startOfDay, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateSelectorProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disablePastDates?: boolean; // Make this prop optional
  disabledDates?: (date: Date) => boolean;
}

export const DateSelector = ({ 
  date, 
  onDateChange, 
  disablePastDates = false, 
  disabledDates 
}: DateSelectorProps) => {
  // Default disabled dates function that only disables past dates if disablePastDates is true
  const defaultDisabledDates = (date: Date) => {
    if (disablePastDates) {
      const today = startOfDay(new Date());
      const checkDate = startOfDay(new Date(date));
      return isBefore(checkDate, today);
    }
    return false;
  };

  // Combine custom disabled function with default if provided
  const isDateDisabled = disabledDates 
    ? (date: Date) => disabledDates(date) || defaultDisabledDates(date)
    : defaultDisabledDates;

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
