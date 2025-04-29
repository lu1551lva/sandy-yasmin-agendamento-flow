
import { StatusUpdateDialog } from "../../StatusUpdateDialog";
import { AppointmentStatus } from "@/types/appointment.types";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useState } from "react";

interface AppointmentStatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  status: AppointmentStatus;
  appointmentId: string;
  onStatusUpdated: () => void;
}

export function AppointmentStatusUpdateDialog({
  isOpen,
  onOpenChange,
  status,
  appointmentId,
  onStatusUpdated
}: AppointmentStatusUpdateDialogProps) {
  const { updateStatus, isLoading } = useUpdateAppointmentStatus();
  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  const getAction = (): "complete" | "cancel" | "delete" | null => {
    switch (status) {
      case "concluido":
        return "complete";
      case "cancelado":
        return "cancel";
      default:
        return null;
    }
  };
  
  const handleConfirm = async () => {
    if (!appointmentId) return;
    
    setIsUpdating(true);
    console.log(`Updating appointment ${appointmentId} status to: ${status}`);
    
    try {
      const success = await updateStatus(appointmentId, status, status === "cancelado" ? cancelReason : undefined);
      if (success) {
        console.log("Status updated successfully");
        onStatusUpdated();
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <StatusUpdateDialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        // Only allow closing if not loading
        if (!isLoading || !open) {
          onOpenChange(open);
        }
      }}
      action={getAction()}
      reason={cancelReason}
      onReasonChange={setCancelReason}
      onConfirm={handleConfirm}
      isLoading={isLoading || isUpdating}
    />
  );
}
