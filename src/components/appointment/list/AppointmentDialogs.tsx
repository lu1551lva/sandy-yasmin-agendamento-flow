
import { useState } from "react";
import { AppointmentDialog } from "../AppointmentDialog";
import { StatusUpdateDialog } from "../StatusUpdateDialog";
import { CancelAppointmentDialog } from "../CancelAppointmentDialog";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentStatusUpdate } from "@/hooks/useAppointmentStatusUpdate";

interface AppointmentDialogsProps {
  selectedAppointment: AppointmentWithDetails | null;
  setSelectedAppointment: (appointment: AppointmentWithDetails | null) => void;
  appointmentToUpdate: { id: string; status: AppointmentStatus } | null;
  setAppointmentToUpdate: (data: { id: string; status: AppointmentStatus } | null) => void;
  isCancelDialogOpen: boolean;
  setIsCancelDialogOpen: (isOpen: boolean) => void;
  appointmentToCancel: string | null;
  setAppointmentToCancel: (id: string | null) => void;
  onAppointmentUpdated?: () => void;
}

export function AppointmentDialogs({
  selectedAppointment,
  setSelectedAppointment,
  appointmentToUpdate,
  setAppointmentToUpdate,
  isCancelDialogOpen,
  setIsCancelDialogOpen,
  appointmentToCancel,
  setAppointmentToCancel,
  onAppointmentUpdated
}: AppointmentDialogsProps) {
  const { updateStatus, isLoading } = useAppointmentStatusUpdate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusUpdate = async () => {
    if (!appointmentToUpdate) return;
    
    setIsProcessing(true);
    
    const success = await updateStatus(appointmentToUpdate.id, appointmentToUpdate.status);
    
    if (success) {
      toast({
        title: appointmentToUpdate.status === 'concluido' ? "Agendamento concluído" : "Status atualizado",
        description: appointmentToUpdate.status === 'concluido' 
          ? "O agendamento foi marcado como concluído com sucesso."
          : "O status do agendamento foi atualizado com sucesso.",
      });
      
      // Ensure list update
      if (onAppointmentUpdated) {
        onAppointmentUpdated();
      }
    }
    
    setIsProcessing(false);
    setAppointmentToUpdate(null);
  };

  const handleCancelAppointment = async (reason: string) => {
    if (!appointmentToCancel) return;
    
    setIsProcessing(true);
    
    const success = await updateStatus(appointmentToCancel, "cancelado", reason);
    
    if (success) {
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
      });
      
      // Ensure list update
      if (onAppointmentUpdated) {
        onAppointmentUpdated();
      }
    }
    
    setIsProcessing(false);
    setIsCancelDialogOpen(false);
    setAppointmentToCancel(null);
  };

  const handleAppointmentDialogClose = () => {
    setSelectedAppointment(null);
    // Ensure list update
    if (onAppointmentUpdated) {
      onAppointmentUpdated();
    }
  };

  return (
    <>
      {selectedAppointment && (
        <AppointmentDialog
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={handleAppointmentDialogClose}
          onAppointmentUpdated={onAppointmentUpdated}
        />
      )}

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        isOpen={!!appointmentToUpdate}
        onOpenChange={() => setAppointmentToUpdate(null)}
        status={appointmentToUpdate?.status || null}
        onConfirm={handleStatusUpdate}
        isLoading={isLoading || isProcessing}
      />

      {/* Appointment Cancel Dialog */}
      <CancelAppointmentDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelAppointment}
        isLoading={isLoading || isProcessing}
      />
    </>
  );
}
