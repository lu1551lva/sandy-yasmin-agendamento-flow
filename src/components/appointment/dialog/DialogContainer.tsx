
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentDetailsDialog } from "./AppointmentDetailsDialog";
import { ConfirmationDialogs } from "./confirmations/ConfirmationDialogs";
import { RescheduleDialog } from "./reschedule/RescheduleDialog";
import { HistorySidebar } from "./history/HistorySidebar";
import { useAppointmentDialog } from "../context/AppointmentDialogContext";

interface DialogContainerProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function DialogContainer({
  appointment,
  isOpen,
  onClose,
}: DialogContainerProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (!appointment) {
    return null;
  }

  const { 
    handleReschedule,
    openStatusUpdateDialog,
    handleStatusUpdate,
    isLoading,
    isReschedulingLoading
  } = useAppointmentDialog();

  // Handle status update for this specific appointment
  const handleComplete = () => {
    openStatusUpdateDialog(appointment.id, 'concluido');
  };

  // Handle cancel for this specific appointment
  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  // Handle delete (to be implemented)
  const handleDelete = () => {
    // Implement delete logic
    onClose();
  };

  // Handle WhatsApp (existing implementation)
  const handleSendWhatsApp = () => {
    // Implement WhatsApp logic
  };

  return (
    <>
      <AppointmentDetailsDialog
        appointment={appointment}
        isOpen={isOpen}
        onClose={onClose}
        onComplete={handleComplete}
        onShowCancelConfirm={handleCancel}
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
        onCancel={() => openStatusUpdateDialog(appointment.id, 'cancelado')}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Reschedule dialog */}
      {showReschedule && (
        <RescheduleDialog
          appointment={appointment}
          isOpen={showReschedule}
          onClose={() => setShowReschedule(false)}
          onReschedule={(date, time) => handleReschedule(date, time)}
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
