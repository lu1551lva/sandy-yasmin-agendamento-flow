
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentDetailsDialog } from "./AppointmentDetailsDialog";
import { ConfirmationDialogs } from "./ConfirmationDialogs";
import { RescheduleDialog } from "./reschedule/RescheduleDialog";
import { HistorySidebar } from "./history/HistorySidebar";
import { useAppointmentActions } from "@/hooks/appointment/useAppointmentActions";
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
  const { 
    completeAppointment, 
    cancelAppointment, 
    rescheduleAppointment, 
    deleteAppointment,
    isLoading 
  } = useAppointmentActions();

  if (!appointment) {
    return null;
  }

  // Handler for completing an appointment
  const handleComplete = async () => {
    console.log("Completing appointment:", appointment.id);
    const success = await completeAppointment(appointment.id);
    
    if (success && onAppointmentUpdated) {
      onAppointmentUpdated();
      onClose();
    }
  };

  // Handler for canceling an appointment
  const handleCancel = async () => {
    console.log("Canceling appointment:", appointment.id);
    const reasonToUse = cancelReason || 'Cancelamento sem motivo especificado';
    const success = await cancelAppointment(appointment.id, reasonToUse);
    
    if (success && onAppointmentUpdated) {
      onAppointmentUpdated();
      onClose();
    }
    
    setShowCancelConfirm(false);
  };

  // Handler for deleting an appointment
  const handleDelete = async () => {
    console.log("Deleting appointment:", appointment.id);
    const success = await deleteAppointment(appointment.id);
    
    if (success && onAppointmentUpdated) {
      onAppointmentUpdated();
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  // Handler for sending WhatsApp message
  const handleSendWhatsApp = () => {
    const message = `Olá ${appointment.cliente.nome.split(' ')[0]}! Confirmamos seu agendamento para ${appointment.servico.nome} no dia ${appointment.data} às ${appointment.hora}.`;
    window.open(createWhatsAppLink(appointment.cliente.telefone, message), "_blank");
  };
  
  // Handler for rescheduling
  const handleReschedule = async (date: Date, time: string) => {
    console.log("Rescheduling appointment:", appointment.id);
    const success = await rescheduleAppointment(
      appointment.id,
      date,
      time
    );
    
    if (success && onAppointmentUpdated) {
      onAppointmentUpdated();
      setShowReschedule(false);
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
        isUpdatingStatus={isLoading}
      />

      {/* Confirmation dialogs (Cancel and Delete) */}
      <ConfirmationDialogs
        showCancelConfirm={showCancelConfirm}
        setShowCancelConfirm={setShowCancelConfirm}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        onCancel={handleCancel}
        onDelete={handleDelete}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        isLoading={isLoading}
      />

      {/* Reschedule dialog */}
      {showReschedule && (
        <RescheduleDialog
          appointment={appointment}
          isOpen={showReschedule}
          onClose={() => setShowReschedule(false)}
          onReschedule={handleReschedule}
          isLoading={isLoading}
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
