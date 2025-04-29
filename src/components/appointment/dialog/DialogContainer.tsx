
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentDetailsDialog } from "./AppointmentDetailsDialog";
import { ConfirmationDialogs } from "./confirmations/ConfirmationDialogs";
import { RescheduleDialog } from "./reschedule/RescheduleDialog";
import { HistorySidebar } from "./history/HistorySidebar";
import { useAppointmentDialog } from "../hooks/useAppointmentDialog";

interface DialogContainerProps {
  appointment: AppointmentWithDetails | null;
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
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (!appointment) {
    return null;
  }

  const { 
    handleReschedule,
    handleStatusUpdate,
    handleDelete,
    isRescheduling,
    isUpdatingStatus,
    isDeleting
  } = useAppointmentDialog({
    appointment,
    onAppointmentUpdated,
    onClose,
    setShowReschedule
  });

  return (
    <>
      <AppointmentDetailsDialog
        appointment={appointment}
        isOpen={isOpen}
        onClose={onClose}
        onAppointmentUpdated={onAppointmentUpdated}
      />

      {/* Confirmation dialogs (Cancel and Delete) */}
      <ConfirmationDialogs
        showCancelConfirm={showCancelConfirm}
        setShowCancelConfirm={setShowCancelConfirm}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        onCancel={() => handleStatusUpdate('cancelado')}
        onDelete={handleDelete}
      />

      {/* Reschedule dialog */}
      {showReschedule && (
        <RescheduleDialog
          appointment={appointment}
          isOpen={showReschedule}
          onClose={() => setShowReschedule(false)}
          onReschedule={handleReschedule}
          isLoading={isRescheduling}
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
