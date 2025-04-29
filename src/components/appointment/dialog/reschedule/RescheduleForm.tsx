
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { DateSelector } from "@/components/shared/date-time/DateSelector";
import { TimeSelector } from "@/components/shared/date-time/TimeSelector";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseISO } from "date-fns";
import { AppointmentWithDetails } from "@/types/appointment.types";

interface RescheduleFormProps {
  appointment: AppointmentWithDetails;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  note: string;
  setNote: (note: string) => void;
  availableTimesData: string[];
}

export function RescheduleForm({
  appointment,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  note,
  setNote,
  availableTimesData
}: RescheduleFormProps) {
  // Parse the date string safely
  const parsedDate = (() => {
    try {
      // Try using parseISO for ISO format dates
      return parseISO(appointment.data);
    } catch (error) {
      console.error("Error parsing date with parseISO:", error);
      try {
        // Fallback to Date constructor
        return new Date(appointment.data);
      } catch (secondError) {
        console.error("Error parsing date with Date constructor:", secondError);
        // Ultimate fallback
        return new Date();
      }
    }
  })();

  const currentDateTime = `${format(parsedDate, 'dd/MM/yyyy', { locale: ptBR })} às ${appointment.hora}`;
  const newDateTime = selectedDate && selectedTime 
    ? `${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} às ${selectedTime}` 
    : "Selecione data e hora";

  return (
    <>
      <Alert className="bg-blue-50 border-blue-200 flex-none">
        <AlertDescription className="text-sm">
          <strong>Agendamento atual:</strong> {currentDateTime} com {appointment.profissional.nome}
        </AlertDescription>
      </Alert>

      <ScrollArea className="flex-grow pr-4 my-4 max-h-[50vh]">
        <div className="grid gap-4">
          <DateSelector
            date={selectedDate}
            onDateChange={setSelectedDate}
            disablePastDates={true}
          />
          
          {selectedDate && (
            <TimeSelector
              professionalId={appointment.profissional.id}
              availableTimes={availableTimesData}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
            />
          )}
          
          <Separator />
          
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Observação (opcional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-h-[80px] p-2 border rounded-md"
              placeholder="Motivo do reagendamento..."
            />
          </div>
        </div>
      </ScrollArea>

      {selectedDate && selectedTime && (
        <Alert className="bg-green-50 border-green-200 flex-none mt-2">
          <AlertDescription className="text-sm">
            <strong>Novo agendamento:</strong> {newDateTime} com {appointment.profissional.nome}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
