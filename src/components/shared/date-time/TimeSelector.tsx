
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/classnames";

interface TimeSelectorProps {
  professionalId: string;
  availableTimes: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export const TimeSelector = ({
  professionalId,
  availableTimes,
  selectedTime,
  onTimeSelect,
}: TimeSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione o horário desejado:</CardTitle>
        <CardDescription>Escolha um horário disponível.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!professionalId ? (
          <div className="text-amber-600 py-2">
            Selecione um profissional para ver os horários disponíveis.
          </div>
        ) : availableTimes.length === 0 ? (
          <div className="text-amber-600 py-2">
            Nenhum horário disponível para este profissional nesta data.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {availableTimes.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                className={cn(
                  "h-12 w-full",
                  selectedTime === time ? "bg-primary text-primary-foreground" : ""
                )}
                onClick={() => onTimeSelect(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
