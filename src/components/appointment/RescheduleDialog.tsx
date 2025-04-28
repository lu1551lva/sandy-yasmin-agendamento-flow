
import React, { useState, useEffect } from "react";
import { format, parseISO as dateFnsParseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateSelector } from "@/components/shared/date-time/DateSelector";
import { TimeSelector } from "@/components/shared/date-time/TimeSelector";
import { useQuery } from "@tanstack/react-query";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { Loader2, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RescheduleDialogProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (date: Date, time: string) => Promise<void>;
  isLoading: boolean;
}

export function RescheduleDialog({
  appointment,
  isOpen,
  onClose,
  onReschedule,
  isLoading,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const { toast } = useToast();

  // Fetch available times for the selected date and service
  const { data: availableTimesData = [] } = useQuery({
    queryKey: [
      'available-times', 
      selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'no-date', 
      appointment.servico.id,
      appointment.profissional.id
    ],
    queryFn: async () => {
      if (!selectedDate || !appointment.servico || !appointment.profissional) {
        return [];
      }
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      // Fetch appointments that might conflict
      const { data: existingAppointments, error } = await supabase
        .from('agendamentos')
        .select('hora')
        .eq('data', formattedDate)
        .eq('profissional_id', appointment.profissional.id)
        .eq('status', 'agendado');
        
      if (error) {
        console.error("Erro ao buscar agendamentos existentes:", error);
        return [];
      }

      // Generate available time slots
      const { horario_inicio, horario_fim } = appointment.profissional;
      const serviceDuration = appointment.servico.duracao_em_minutos;

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
        
        // Check if this time slot is already booked
        const isSlotBooked = existingAppointments.some(
          appointment => appointment.hora === timeSlot
        );

        // Only add available slots
        if (!isSlotBooked) {
          slots.push(timeSlot);
        }

        // Move to next slot based on service duration
        currentMinute += serviceDuration;
        while (currentMinute >= 60) {
          currentMinute -= 60;
          currentHour += 1;
        }
      }
      
      console.log(`Horários disponíveis: ${slots.join(', ')}`);
      return slots;
    },
    enabled: !!selectedDate && isOpen,
    staleTime: 0 // Don't cache this data
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(undefined);
      setSelectedTime("");
      setNote("");
    }
  }, [isOpen]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione uma data e horário",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("Iniciando processo de reagendamento...");
      await onReschedule(selectedDate, selectedTime);
      
      // Create history entry
      const originalDateTime = `${appointment.data} ${appointment.hora}`;
      const newDateTime = `${format(selectedDate, 'yyyy-MM-dd')} ${selectedTime}`;
      
      console.log("Criando registro no histórico...");
      
      await supabase
        .from('agendamento_historico')
        .insert({
          agendamento_id: appointment.id,
          tipo: "reagendado",
          descricao: "Agendamento reagendado",
          valor_anterior: originalDateTime,
          novo_valor: newDateTime,
          observacao: note || "Reagendamento sem observação"
        });
        
      console.log("Reagendamento concluído com sucesso");
      
    } catch (error) {
      console.error("Erro ao reagendar:", error);
      toast({
        title: "Erro ao reagendar",
        description: "Ocorreu um erro durante o reagendamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Parse the date string using our utility function
  const parsedDate = safeDateParse(appointment.data);
  const currentDateTime = `${format(parsedDate, 'dd/MM/yyyy')} às ${appointment.hora}`;
  const newDateTime = selectedDate && selectedTime 
    ? `${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}` 
    : "Selecione data e hora";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Reagendar Horário
          </DialogTitle>
          <DialogDescription>
            Selecione uma nova data e horário para o agendamento de{" "}
            {appointment.cliente.nome}
          </DialogDescription>
        </DialogHeader>

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

        <DialogFooter className="flex-none mt-4 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!selectedDate || !selectedTime || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reagendando...
              </>
            ) : (
              "Confirmar Reagendamento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to safely parse a date string
function safeDateParse(dateString: string): Date {
  try {
    // Try using date-fns parseISO first
    return dateFnsParseISO(dateString);
  } catch (error) {
    // Fallback to native Date constructor
    try {
      return new Date(dateString);
    } catch (secondError) {
      console.error('Error parsing date:', secondError);
      return new Date();
    }
  }
}
