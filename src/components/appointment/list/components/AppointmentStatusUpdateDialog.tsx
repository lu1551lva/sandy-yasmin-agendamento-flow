
import { StatusUpdateDialog } from "../../StatusUpdateDialog";
import { AppointmentStatus } from "@/types/appointment.types";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const { updateStatus, deleteAppointment, isLoading } = useUpdateAppointmentStatus();
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
      let success = false;
      
      if (status === "cancelado") {
        success = await updateStatus(appointmentId, status, cancelReason);
      } else if (status === "concluido") {
        success = await updateStatus(appointmentId, status);
      }
      
      if (success) {
        console.log("Status updated successfully");
        toast({
          title: "Status atualizado",
          description: `O agendamento foi ${status === "concluido" ? "concluído" : "cancelado"} com sucesso.`,
        });
        onStatusUpdated();
        onOpenChange(false);
      } else {
        console.error("Failed to update status");
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status do agendamento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do agendamento.",
        variant: "destructive",
      });
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
