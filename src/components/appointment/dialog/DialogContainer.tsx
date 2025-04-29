
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentDetailsDialog } from "./AppointmentDetailsDialog";
import { ConfirmationDialogs } from "./confirmations/ConfirmationDialogs";
import { RescheduleDialog } from "./reschedule/RescheduleDialog";
import { HistorySidebar } from "./history/HistorySidebar";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";
import { useToast } from "@/hooks/use-toast";
import { createWhatsAppLink } from "@/lib/supabase";

interface DialogContainerProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated?: () => void;
}

export function DialogContainer({
  appointment,
  isOpen,
  onClose,
  onAppointmentUpdated
}: DialogContainerProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  const { toast } = useToast();
  const { updateStatus, isLoading: isUpdatingStatus } = useUpdateAppointmentStatus();
  const { rescheduleAppointment, isLoading: isReschedulingLoading } = useRescheduleAppointment();

  if (!appointment) {
    return null;
  }

  // Handle status update for this specific appointment
  const handleComplete = async () => {
    console.log("Completing appointment:", appointment.id);
    const success = await updateStatus(appointment.id, 'concluido');
    
    if (success) {
      toast({
        title: "Agendamento concluído",
        description: "O agendamento foi marcado como concluído com sucesso."
      });
      if (onAppointmentUpdated) onAppointmentUpdated();
      onClose();
    }
  };

  // Handle cancel for this specific appointment
  const handleCancel = async () => {
    console.log("Canceling appointment:", appointment.id);
    const reasonToUse = cancelReason || 'Cancelamento sem motivo especificado';
    const success = await updateStatus(appointment.id, 'cancelado', reasonToUse);
    
    if (success) {
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso."
      });
      if (onAppointmentUpdated) onAppointmentUpdated();
      onClose();
    }
    
    setShowCancelConfirm(false);
  };

  // Handle delete (to be implemented)
  const handleDelete = () => {
    console.log("Deleting appointment:", appointment.id);
    // Implement delete logic
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exclusão de agendamentos será implementada em breve."
    });
    setShowDeleteConfirm(false);
    onClose();
  };

  // Handle WhatsApp message
  const handleSendWhatsApp = () => {
    const message = `Olá ${appointment.cliente.nome.split(' ')[0]}! Confirmamos seu agendamento para ${appointment.servico.nome} no dia ${appointment.data} às ${appointment.hora}.`;
    window.open(createWhatsAppLink(appointment.cliente.telefone, message), "_blank");
  };
  
  // Handle rescheduling
  const handleReschedule = async (date: Date, time: string) => {
    console.log("Rescheduling appointment:", appointment.id);
    const success = await rescheduleAppointment(
      appointment.id,
      date,
      time,
      appointment.profissional.id
    );
    
    if (success) {
      toast({
        title: "Agendamento reagendado",
        description: "O agendamento foi reagendado com sucesso."
      });
      
      setShowReschedule(false);
      if (onAppointmentUpdated) onAppointmentUpdated();
      onClose();
      return true;
    }
    
    return false;
  };

  return (
    <>
      <AppointmentDetailsDialog
        appointment={appointment}
        isOpen={isOpen}
        onClose={onClose}
        onComplete={handleComplete}
        onShowCancelConfirm={() => setShowCancelConfirm(true)}
        onShowReschedule={() => setShowReschedule(true)}
        onSendWhatsApp={handleSendWhatsApp}
        onShowHistory={() => setShowHistory(true)}
        onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
        isUpdatingStatus={isUpdatingStatus}
      />

      {/* Confirmation dialogs (Cancel and Delete) */}
      <ConfirmationDialogs
        showCancelConfirm={showCancelConfirm}
        setShowCancelConfirm={setShowCancelConfirm}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        onCancel={handleCancel}
        onDelete={handleDelete}
        isLoading={isUpdatingStatus}
      />

      {/* Reschedule dialog */}
      {showReschedule && (
        <RescheduleDialog
          appointment={appointment}
          isOpen={showReschedule}
          onClose={() => setShowReschedule(false)}
          onReschedule={handleReschedule}
          isLoading={isReschedulingLoading}
        />
      )}

      {/* History sidebar */}
      <HistorySidebar
        appointmentId={appointment.id}
        isOpen={showHistory}
        onOpenChange={setShowHistory}
      />
    </>
  );
}
