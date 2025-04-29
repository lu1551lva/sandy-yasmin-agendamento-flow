
import { useState } from "react";
import { AppointmentStatus, AppointmentWithDetails } from "@/types/appointment.types";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";
import { useToast } from "@/hooks/use-toast";
import { 
  logAppointmentAction, 
  logAppointmentError, 
  traceAppointmentFlow, 
  debugAppointmentState,
  logStackTrace,
  logUIEvent
} from "@/utils/debugUtils";

export function useAppointmentDialogsState(onAppointmentUpdated: () => void) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{ id: string; status: AppointmentStatus } | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  const { toast } = useToast();
  const { updateStatus, isLoading } = useUpdateAppointmentStatus();
  const { rescheduleAppointment, isLoading: isReschedulingLoading } = useRescheduleAppointment();

  // Debug log do estado atual
  const debugCurrentState = () => {
    debugAppointmentState("useAppointmentDialogsState", {
      selectedAppointment: selectedAppointment?.id || null,
      appointmentToUpdate,
      appointmentToCancel,
      isCancelDialogOpen,
      isRescheduleDialogOpen,
      cancelReason,
      isLoading,
      isReschedulingLoading
    });
  };

  const handleUpdateStatus = async () => {
    debugCurrentState();
    logStackTrace("handleUpdateStatus chamado");

    if (!appointmentToUpdate) {
      logAppointmentError("Nenhum agendamento selecionado para atualização", "undefined");
      toast({
        title: "Erro na operação",
        description: "ID de agendamento inválido. Por favor, tente novamente.",
        variant: "destructive",
      });
      return;
    }

    traceAppointmentFlow("Iniciando atualização", appointmentToUpdate.id, appointmentToUpdate.status);

    try {
      logAppointmentAction("Chamando updateStatus", appointmentToUpdate.id, { 
        status: appointmentToUpdate.status,
        params: [appointmentToUpdate.id, appointmentToUpdate.status]
      });

      const success = await updateStatus(appointmentToUpdate.id, appointmentToUpdate.status);
      
      if (success) {
        logAppointmentAction("Atualização bem-sucedida", appointmentToUpdate.id, appointmentToUpdate.status);
        setAppointmentToUpdate(null);
        logUIEvent("Chamando onAppointmentUpdated após atualização bem-sucedida");
        onAppointmentUpdated();
        toast({
          title: appointmentToUpdate.status === 'concluido' ? 'Agendamento concluído' : 'Status atualizado',
          description: appointmentToUpdate.status === 'concluido'
            ? 'O agendamento foi marcado como concluído com sucesso.'
            : 'O status do agendamento foi atualizado com sucesso.',
        });
      } else {
        logAppointmentError("Falha na atualização", appointmentToUpdate.id);
        toast({
          title: "Falha na operação",
          description: "Não foi possível atualizar o status do agendamento. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logAppointmentError("Erro inesperado na atualização", appointmentToUpdate.id, error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    debugCurrentState();
    logStackTrace("handleCancel chamado");
    
    if (!appointmentToCancel) {
      logAppointmentError("Nenhum ID para cancelamento", "null", { appointmentToCancel });
      toast({
        title: "Erro na operação",
        description: "ID de agendamento inválido. Por favor, tente novamente.",
        variant: "destructive",
      });
      return;
    }

    const reasonToUse = cancelReason || "Cancelamento sem motivo especificado";
    traceAppointmentFlow("Iniciando cancelamento", appointmentToCancel, { motivo: reasonToUse });

    try {
      logAppointmentAction("Chamando updateStatus para cancelamento", appointmentToCancel, { 
        status: "cancelado",
        motivo: reasonToUse,
        params: [appointmentToCancel, "cancelado", reasonToUse]
      });

      const success = await updateStatus(appointmentToCancel, "cancelado", reasonToUse);
      
      if (success) {
        logAppointmentAction("Cancelamento bem-sucedido", appointmentToCancel, { motivo: reasonToUse });
        setIsCancelDialogOpen(false);
        setAppointmentToCancel(null);
        setCancelReason("");
        logUIEvent("Chamando onAppointmentUpdated após cancelamento bem-sucedido");
        onAppointmentUpdated();
        toast({
          title: "Agendamento cancelado",
          description: "O agendamento foi cancelado com sucesso.",
        });
      } else {
        logAppointmentError("Falha no cancelamento", appointmentToCancel);
        toast({
          title: "Falha na operação",
          description: "Não foi possível cancelar o agendamento. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logAppointmentError("Erro inesperado no cancelamento", appointmentToCancel, error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleReschedule = async (date: Date, time: string) => {
    debugCurrentState();
    logStackTrace("handleReschedule chamado");

    if (!selectedAppointment) {
      logAppointmentError("Nenhum agendamento selecionado para reagendamento", "null");
      return Promise.reject("Nenhum agendamento selecionado");
    }

    try {
      traceAppointmentFlow("Iniciando reagendamento", selectedAppointment.id, { date, time });

      logAppointmentAction("Chamando rescheduleAppointment", selectedAppointment.id, { 
        date, 
        time, 
        profissionalId: selectedAppointment.profissional.id,
        params: [selectedAppointment.id, date, time, selectedAppointment.profissional.id]
      });

      const success = await rescheduleAppointment(
        selectedAppointment.id,
        date,
        time,
        selectedAppointment.profissional.id
      );

      if (success) {
        logAppointmentAction("Reagendamento bem-sucedido", selectedAppointment.id, { date, time });
        setIsRescheduleDialogOpen(false);
        logUIEvent("Chamando onAppointmentUpdated após reagendamento bem-sucedido");
        onAppointmentUpdated();
        toast({
          title: "Agendamento reagendado",
          description: "O horário foi atualizado com sucesso!",
        });
        return Promise.resolve();
      } else {
        throw new Error("Falha ao reagendar agendamento");
      }
    } catch (error) {
      logAppointmentError("Erro ao reagendar", selectedAppointment.id, error);
      toast({
        title: "Erro ao reagendar",
        description: "Não foi possível reagendar o agendamento. Tente novamente.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  return {
    selectedAppointment,
    setSelectedAppointment,
    appointmentToUpdate,
    setAppointmentToUpdate,
    appointmentToCancel,
    setAppointmentToCancel,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    isRescheduleDialogOpen,
    setIsRescheduleDialogOpen,
    cancelReason,
    setCancelReason,
    isLoading,
    isReschedulingLoading,
    handleUpdateStatus,
    handleCancel,
    handleReschedule,
  };
}
