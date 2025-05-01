
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { Loader2, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RescheduleForm } from "./RescheduleForm";
import { useRescheduleForm } from "./hooks/useRescheduleForm";

interface RescheduleDialogProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (date: Date, time: string) => Promise<boolean>;
  isLoading: boolean;
}

export function RescheduleDialog({
  appointment,
  isOpen,
  onClose,
  onReschedule,
  isLoading,
}: RescheduleDialogProps) {
  const { toast } = useToast();
  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    note,
    setNote,
    availableTimesData,
    validateForm
  } = useRescheduleForm({ appointment, isOpen });

  const handleReschedule = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log("Iniciando processo de reagendamento...");
      const success = await onReschedule(selectedDate!, selectedTime);
      
      if (success) {
        console.log("Reagendamento concluído com sucesso");
        onClose();
      }
    } catch (error) {
      console.error("Erro ao reagendar:", error);
      toast({
        title: "Erro ao reagendar",
        description: "Ocorreu um erro durante o reagendamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

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

        <RescheduleForm
          appointment={appointment}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          note={note}
          setNote={setNote}
          availableTimesData={availableTimesData}
        />

        <DialogFooter className="flex-none mt-4 border-t pt-4 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!selectedDate || !selectedTime || isLoading}
            className="w-full sm:w-auto"
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
