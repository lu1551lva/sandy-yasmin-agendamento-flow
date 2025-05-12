
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

  const handleReschedule = async (date: Date, time: string) => {
    try {
      console.log("Iniciando processo de reagendamento...");
      const success = await onReschedule(date, time);
      
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
          onReschedule={handleReschedule}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
