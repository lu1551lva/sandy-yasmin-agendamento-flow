
import { useState } from "react";
import { AppointmentStatus, AppointmentWithDetails } from "@/types/appointment.types";
import { useAppointmentStatusUpdate } from "@/hooks/useAppointmentStatusUpdate";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";
import { useToast } from "@/hooks/use-toast";

export function useAppointmentDialogsState(onAppointmentUpdated: () => void) {
  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{ id: string; status: AppointmentStatus } | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { toast } = useToast();

  // Hooks for API operations
  const { updateStatus, isLoading } = useAppointmentStatusUpdate();
  const { rescheduleAppointment, isLoading: isReschedulingLoading } = useRescheduleAppointment();

  // Handle updating appointment status
  const handleUpdateStatus = async () => {
    if (!appointmentToUpdate) {
      console.error("Nenhum agendamento selecionado para atualização");
      return;
    }
    
    console.log(`Tentando atualizar agendamento ${appointmentToUpdate.id} para status ${appointmentToUpdate.status}`);
    
    try {
      const success = await updateStatus(
        appointmentToUpdate.id, 
        appointmentToUpdate.status
      );
      
      if (success) {
        console.log(`Agendamento ${appointmentToUpdate.id} atualizado com sucesso para ${appointmentToUpdate.status}`);
        setAppointmentToUpdate(null);
        
        // Call the callback to update the UI
        onAppointmentUpdated();
        
        toast({
          title: appointmentToUpdate.status === 'concluido' ? 'Agendamento concluído' : 'Status atualizado',
          description: appointmentToUpdate.status === 'concluido' 
            ? 'O agendamento foi marcado como concluído com sucesso.' 
            : 'O status do agendamento foi atualizado com sucesso.',
        });
      } else {
        console.error(`Falha ao atualizar agendamento ${appointmentToUpdate.id}`);
        toast({
          title: "Falha na operação",
          description: "Não foi possível atualizar o status do agendamento. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro inesperado ao atualizar status:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handle cancelling appointment
  const handleCancel = async () => {
    if (!appointmentToCancel) {
      console.error("Nenhum agendamento selecionado para cancelamento");
      return;
    }
    
    console.log(`Tentando cancelar agendamento ${appointmentToCancel} com motivo: ${cancelReason || "Não especificado"}`);
    
    try {
      const success = await updateStatus(
        appointmentToCancel, 
        "cancelado", 
        cancelReason || "Cancelamento sem motivo especificado"
      );
      
      if (success) {
        console.log(`Agendamento ${appointmentToCancel} cancelado com sucesso`);
        setIsCancelDialogOpen(false);
        setAppointmentToCancel(null);
        setCancelReason("");
        
        // Call the callback to update the UI
        onAppointmentUpdated();
        
        toast({
          title: "Agendamento cancelado",
          description: "O agendamento foi cancelado com sucesso.",
        });
      } else {
        console.error(`Falha ao cancelar agendamento ${appointmentToCancel}`);
        toast({
          title: "Falha na operação",
          description: "Não foi possível cancelar o agendamento. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro inesperado ao cancelar agendamento:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handle appointment reschedule
  const handleReschedule = async (date: Date, time: string) => {
    if (!selectedAppointment) {
      console.error("Nenhum agendamento selecionado para reagendamento");
      return Promise.reject("Nenhum agendamento selecionado");
    }
    
    try {
      console.log(`Tentando reagendar agendamento ${selectedAppointment.id} para ${date} às ${time}`);
      
      const success = await rescheduleAppointment(
        selectedAppointment.id, 
        date, 
        time,
        selectedAppointment.profissional.id
      );
      
      if (success) {
        setIsRescheduleDialogOpen(false);
        
        // Call the callback to update the UI
        onAppointmentUpdated();
        
        console.log(`Agendamento ${selectedAppointment.id} reagendado com sucesso`);
        
        toast({
          title: "Agendamento reagendado",
          description: "O horário foi atualizado com sucesso!",
        });
        
        return Promise.resolve();
      } else {
        throw new Error("Falha ao reagendar agendamento");
      }
    } catch (error) {
      console.error("Erro ao reagendar:", error);
      
      toast({
        title: "Erro ao reagendar",
        description: "Não foi possível reagendar o agendamento. Tente novamente.",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    }
  };

  return {
    // Dialog states
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
    
    // Loading states
    isLoading,
    isReschedulingLoading,
    
    // Handlers
    handleUpdateStatus,
    handleCancel,
    handleReschedule
  };
}
