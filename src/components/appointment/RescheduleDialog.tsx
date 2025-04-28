
import React, { useState } from "react";
import { format } from "date-fns";
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
import { useTimeSlots } from "@/components/shared/date-time/hooks/useTimeSlots";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { Loader2, CalendarClock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

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

  const availableTimes = useTimeSlots({
    date: selectedDate,
    selectedService: appointment.servico,
    professional: appointment.profissional,
    appointments: []
  });

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
      await onReschedule(selectedDate, selectedTime);
      
      // Create history entry
      const originalDateTime = `${appointment.data} ${appointment.hora}`;
      const newDateTime = `${format(selectedDate, 'yyyy-MM-dd')} ${selectedTime}`;
      
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
        
    } catch (error) {
      console.error("Erro ao reagendar:", error);
    }
  };

  const currentDateTime = `${format(parseISO(appointment.data), 'dd/MM/yyyy')} às ${appointment.hora}`;
  const newDateTime = selectedDate && selectedTime 
    ? `${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}` 
    : "Selecione data e hora";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Reagendar Horário
          </DialogTitle>
          <DialogDescription>
            Selecione uma nova data e horário para o agendamento de{" "}
            {appointment.cliente.nome}
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm">
            <strong>Agendamento atual:</strong> {currentDateTime} com {appointment.profissional.nome}
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 py-4">
          <DateSelector
            date={selectedDate}
            onDateChange={setSelectedDate}
            disablePastDates={true}
          />
          
          {selectedDate && (
            <TimeSelector
              professionalId={appointment.profissional.id}
              availableTimes={availableTimes}
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

        {selectedDate && selectedTime && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-sm">
              <strong>Novo agendamento:</strong> {newDateTime} com {appointment.profissional.nome}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
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

// Helper function to parse ISO date string
function parseISO(dateString: string): Date {
  try {
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
}
