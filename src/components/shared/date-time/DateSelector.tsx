
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getHolidays } from "@/lib/utils";

interface DateSelectorProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabledDates?: (date: Date) => boolean;
}

export const DateSelector = ({ date, onDateChange, disabledDates }: DateSelectorProps) => {
  // Default disabled dates function that only disables past dates
  const defaultDisabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
  };

  // Use custom disabled function if provided, otherwise use default
  const isDateDisabled = disabledDates || defaultDisabledDates;

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
