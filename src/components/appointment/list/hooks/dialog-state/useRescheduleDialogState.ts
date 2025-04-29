
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";
import { useToast } from "@/hooks/use-toast";
import { 
  logAppointmentAction, 
  logAppointmentError,
  traceAppointmentFlow,
  logUIEvent,
  logStackTrace
} from "@/utils/debugUtils";

/**
 * Hook for managing appointment reschedule dialog state and actions
 */
export function useRescheduleDialogState(onAppointmentUpdated: () => void) {
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const { toast } = useToast();
  const { rescheduleAppointment, isLoading: isReschedulingLoading } = useRescheduleAppointment();

  /**
   * Handles rescheduling an appointment
   */
  const handleReschedule = async (appointment: AppointmentWithDetails | null, date: Date, time: string): Promise<boolean> => {
    logStackTrace("handleReschedule chamado");

    if (!appointment || !appointment.id) {
      logAppointmentError("Nenhum agendamento selecionado para reagendamento", "null");
      toast({
        title: "Erro na operação",
        description: "Agendamento inválido. Por favor, tente novamente.",
        variant: "destructive",
      });
      return false;
    }

    try {
      traceAppointmentFlow("Iniciando reagendamento", appointment.id, { date, time });

      logAppointmentAction("Chamando rescheduleAppointment", appointment.id, { 
        date, 
        time, 
        profissionalId: appointment.profissional.id,
        params: [appointment.id, date, time, appointment.profissional.id]
      });

      const success = await rescheduleAppointment(
        appointment.id,
        date,
        time,
        appointment.profissional.id
      );

      if (success) {
        logAppointmentAction("Reagendamento bem-sucedido", appointment.id, { date, time });
        setIsRescheduleDialogOpen(false);
        logUIEvent("Chamando onAppointmentUpdated após reagendamento bem-sucedido");
        onAppointmentUpdated();
        toast({
          title: "Agendamento reagendado",
          description: "O horário foi atualizado com sucesso!",
        });
        return true;
      } else {
        throw new Error("Falha ao reagendar agendamento");
      }
    } catch (error) {
      logAppointmentError("Erro ao reagendar", appointment.id, error);
      toast({
        title: "Erro ao reagendar",
        description: "Não foi possível reagendar o agendamento. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isRescheduleDialogOpen,
    setIsRescheduleDialogOpen,
    isReschedulingLoading,
    handleReschedule
  };
}
