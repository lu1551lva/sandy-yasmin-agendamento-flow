
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <Label htmlFor="time">Horário</Label>
        {!professionalId ? (
          <div className="text-amber-600 py-2">
            Selecione um profissional para ver os horários disponíveis.
          </div>
        ) : availableTimes.length === 0 ? (
          <div className="text-amber-600 py-2">
            Nenhum horário disponível para este profissional nesta data.
          </div>
        ) : (
          <Select onValueChange={onTimeSelect} value={selectedTime}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um horário" />
            </SelectTrigger>
            <SelectContent>
              {availableTimes.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
};
