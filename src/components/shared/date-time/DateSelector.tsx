
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateSelectorProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export const DateSelector = ({ date, onDateChange }: DateSelectorProps) => {
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
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date ? isBefore(date, today) : false;
          }}
          locale={ptBR}
          className="pointer-events-auto"
        />
      </CardContent>
    </Card>
  );
};
