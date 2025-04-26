
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
import { Loader2 } from "lucide-react";

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

  const availableTimes = useTimeSlots({
    date: selectedDate,
    selectedService: appointment.servico,
    professional: appointment.profissional,
    appointments: []
  });

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return;
    await onReschedule(selectedDate, selectedTime);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reagendar Horário</DialogTitle>
          <DialogDescription>
            Selecione uma nova data e horário para o agendamento de{" "}
            {appointment.cliente.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <DateSelector
            date={selectedDate}
            onDateChange={setSelectedDate}
          />
          
          {selectedDate && (
            <TimeSelector
              professionalId={appointment.profissional.id}
              availableTimes={availableTimes}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
