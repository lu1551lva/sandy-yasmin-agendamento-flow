
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader } from "lucide-react";

interface DateAndTimeSelectorProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date | undefined) => void;
  onSelectTime: (time: string) => void;
  availableTimeSlots: string[];
  loading: boolean;
  professional: any;
  isDateDisabled: (date: Date) => boolean;
}

export default function DateAndTimeSelector({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  availableTimeSlots,
  loading,
  isDateDisabled,
}: DateAndTimeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="font-medium mb-4">Selecione uma data:</h3>
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={onSelectDate}
          disabled={isDateDisabled}
          locale={ptBR}
          className="rounded-md border shadow p-3 bg-white pointer-events-auto"
        />
        {selectedDate && (
          <p className="mt-2 text-sm text-gray-500">
            Data selecionada: {formatDate(selectedDate)}
          </p>
        )}
      </div>

      <div>
        <h3 className="font-medium mb-4">Selecione um horário:</h3>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !selectedDate ? (
          <div className="border rounded-md p-8 text-center text-gray-500 h-64 flex items-center justify-center">
            Selecione uma data para ver os horários disponíveis
          </div>
        ) : availableTimeSlots.length === 0 ? (
          <div className="border rounded-md p-8 text-center text-gray-500 h-64 flex items-center justify-center flex-col">
            <p className="mb-2">Não há horários disponíveis nesta data.</p>
            <p className="text-sm">Por favor, selecione outro dia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md">
            {availableTimeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                className={`text-sm ${
                  selectedTime === time ? "bg-primary" : "hover:bg-primary/10"
                }`}
                onClick={() => onSelectTime(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
