
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useAppointmentDialog } from "../hooks/useAppointmentDialog";
import { DialogHeader } from "./DialogHeader";
import { DialogBody } from "./DialogBody";
import { DialogActions } from "./DialogActions";
import { RescheduleForm } from "./reschedule/RescheduleForm";

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
  onAppointmentUpdated = () => {}
}: DialogContainerProps) {
  const [showReschedule, setShowReschedule] = useState(false);
  
  const {
    handleReschedule,
    handleStatusUpdate,
    isRescheduling,
    isUpdatingStatus,
    isLoading
  } = useAppointmentDialog({ 
    appointment, 
    onAppointmentUpdated,
    onClose,
    setShowReschedule
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setShowReschedule(false);
      }
    }}>
      <DialogContent className="max-w-lg">
        {!showReschedule ? (
          <>
            <DialogHeader appointment={appointment} />
            <DialogBody appointment={appointment} />
            <DialogActions
              appointment={appointment}
              onRescheduleClick={() => setShowReschedule(true)}
              onComplete={() => handleStatusUpdate("concluido")}
              onCancel={() => handleStatusUpdate("cancelado")}
              isLoading={isLoading}
            />
          </>
        ) : (
          <RescheduleForm
            appointment={appointment}
            onReschedule={handleReschedule}
            onCancel={() => setShowReschedule(false)}
            isLoading={isRescheduling}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
