
import { useState } from "react";
import { AppointmentDialog } from "./AppointmentDialog";
import { StatusUpdateDialog } from "./StatusUpdateDialog";
import { CancelAppointmentDialog } from "./CancelAppointmentDialog";
import { AppointmentsSection } from "./AppointmentsSection";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { useAppointmentStatusUpdate } from "@/hooks/useAppointmentStatusUpdate";
import { useToast } from "@/hooks/use-toast";

interface AppointmentListProps {
  appointments: AppointmentWithDetails[];
  onAppointmentUpdated?: () => void;
  showAll?: boolean;
}

export function AppointmentList({ 
  appointments, 
  onAppointmentUpdated, 
  showAll = false 
}: AppointmentListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{ id: string; status: AppointmentStatus } | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const { updateStatus, isLoading } = useAppointmentStatusUpdate();
  const { toast } = useToast();

  const handleStatusUpdate = async () => {
    if (!appointmentToUpdate) return;
    
    const success = await updateStatus(appointmentToUpdate.id, appointmentToUpdate.status);
    if (success) {
      toast({
        title: appointmentToUpdate.status === 'concluido' ? "Agendamento concluído" : "Status atualizado",
        description: appointmentToUpdate.status === 'concluido' 
          ? "O agendamento foi marcado como concluído com sucesso."
          : "O status do agendamento foi atualizado com sucesso.",
      });
      
      if (onAppointmentUpdated) {
        onAppointmentUpdated();
      }
    }
    setAppointmentToUpdate(null);
  };

  const handleCancelAppointment = async (reason: string) => {
    if (!appointmentToCancel) return;
    
    const success = await updateStatus(appointmentToCancel, "cancelado", reason);
    if (success) {
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
      });
      
      if (onAppointmentUpdated) {
        onAppointmentUpdated();
      }
    }
    setIsCancelDialogOpen(false);
    setAppointmentToCancel(null);
  };

  const openCancelDialog = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setIsCancelDialogOpen(true);
  };

  const handleAppointmentDialogClose = () => {
    setSelectedAppointment(null);
    if (onAppointmentUpdated) {
      onAppointmentUpdated();
    }
  };

  // Filter active appointments unless showAll is true
  const filteredAppointments = showAll 
    ? appointments 
    : appointments.filter(appointment => appointment.status !== "cancelado");

  if (!filteredAppointments || filteredAppointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum agendamento encontrado.
      </div>
    );
  }

  // Group appointments by status for better organization
  const groupedAppointments = {
    agendado: filteredAppointments.filter(app => app.status === "agendado"),
    concluido: filteredAppointments.filter(app => app.status === "concluido"),
    cancelado: filteredAppointments.filter(app => app.status === "cancelado" && showAll),
  };

  return (
    <>
      <div className="space-y-6">
        {/* Agendados */}
        <AppointmentsSection
          title="Agendamentos Ativos"
          titleClassName="text-blue-800"
          appointments={groupedAppointments.agendado}
          onShowDetails={setSelectedAppointment}
          onComplete={(id) => setAppointmentToUpdate({ id, status: "concluido" })}
          onCancel={openCancelDialog}
          isLoading={isLoading}
        />
        
        {/* Concluídos */}
        {groupedAppointments.concluido.length > 0 && (
          <AppointmentsSection
            title="Agendamentos Concluídos"
            titleClassName="text-green-800"
            appointments={groupedAppointments.concluido}
            onShowDetails={setSelectedAppointment}
            onComplete={(id) => setAppointmentToUpdate({ id, status: "concluido" })}
            onCancel={openCancelDialog}
            isLoading={isLoading}
          />
        )}
        
        {/* Cancelados - Só mostrar se showAll estiver ativo */}
        {groupedAppointments.cancelado.length > 0 && (
          <AppointmentsSection
            title="Agendamentos Cancelados"
            titleClassName="text-red-800"
            appointments={groupedAppointments.cancelado}
            onShowDetails={setSelectedAppointment}
            onComplete={(id) => setAppointmentToUpdate({ id, status: "concluido" })}
            onCancel={openCancelDialog}
            isLoading={isLoading}
          />
        )}
      </div>
      
      {selectedAppointment && (
        <AppointmentDialog
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={handleAppointmentDialogClose}
          onAppointmentUpdated={onAppointmentUpdated}
        />
      )}

      {/* Diálogo de Confirmação para Concluir/Cancelar */}
      <StatusUpdateDialog
        isOpen={!!appointmentToUpdate}
        onOpenChange={() => setAppointmentToUpdate(null)}
        status={appointmentToUpdate?.status || null}
        onConfirm={handleStatusUpdate}
      />

      {/* Diálogo para cancelar com motivo */}
      <CancelAppointmentDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelAppointment}
        isLoading={isLoading}
      />
    </>
  );
}
