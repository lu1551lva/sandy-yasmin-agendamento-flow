
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentStatusSection } from "./list/AppointmentStatusSection";
import { AppointmentDialog } from "./AppointmentDialog";
import { AppointmentStatusUpdateDialog } from "./list/components/AppointmentStatusUpdateDialog";
import { AppointmentCancelDialog } from "./list/components/AppointmentCancelDialog";
import { useAppointmentGrouper } from "./list/AppointmentGrouper";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";

interface AppointmentListProps {
  appointments: AppointmentWithDetails[];
  onAppointmentUpdated?: () => void;
  showAll?: boolean;
}

export function AppointmentList({
  appointments,
  onAppointmentUpdated = () => {},
  showAll = false
}: AppointmentListProps) {
  // Local state for dialogs
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{ id: string; status: "concluido" | "cancelado" } | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  // Dialog visibility state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  // Status update hook
  const { isLoading } = useUpdateAppointmentStatus();

  // Group appointments by status
  const { groupedAppointments, isEmpty } = useAppointmentGrouper({ 
    appointments, 
    showAll 
  });

  // Handlers for opening dialogs
  const handleShowDetails = (appointment: AppointmentWithDetails) => {
    console.log("Opening details for appointment:", appointment.id);
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleComplete = (appointmentId: string) => {
    console.log("Marking as complete:", appointmentId);
    setAppointmentToUpdate({ id: appointmentId, status: "concluido" });
    setIsStatusDialogOpen(true);
  };

  const handleCancel = (appointmentId: string) => {
    console.log("Opening cancel dialog for:", appointmentId);
    setAppointmentToCancel(appointmentId);
    setIsCancelDialogOpen(true);
  };

  // When any dialog closes and needs to refresh data
  const handleDialogClosed = (refreshData: boolean = false) => {
    if (refreshData && onAppointmentUpdated) {
      console.log("Refreshing appointments data after dialog action");
      onAppointmentUpdated();
    }
  };

  // If no appointments, show empty state
  if (isEmpty) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Appointments */}
      <AppointmentStatusSection
        title="Agendamentos Ativos"
        titleClassName="text-blue-800"
        appointments={groupedAppointments.agendado}
        onShowDetails={handleShowDetails}
        onComplete={handleComplete}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
      
      {/* Completed Appointments */}
      {showAll && groupedAppointments.concluido.length > 0 && (
        <AppointmentStatusSection
          title="Agendamentos Concluídos"
          titleClassName="text-green-800"
          appointments={groupedAppointments.concluido}
          onShowDetails={handleShowDetails}
          onComplete={handleComplete}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
      
      {/* Canceled Appointments */}
      {showAll && groupedAppointments.cancelado.length > 0 && (
        <AppointmentStatusSection
          title="Agendamentos Cancelados"
          titleClassName="text-red-800"
          appointments={groupedAppointments.cancelado}
          onShowDetails={handleShowDetails}
          onComplete={handleComplete}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDialog
          appointment={selectedAppointment}
          isOpen={isDetailsDialogOpen}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedAppointment(null);
          }}
          onAppointmentUpdated={() => handleDialogClosed(true)}
        />
      )}
      
      {/* Status Update Dialog */}
      {appointmentToUpdate && (
        <AppointmentStatusUpdateDialog
          isOpen={isStatusDialogOpen}
          onOpenChange={(open) => {
            setIsStatusDialogOpen(open);
            if (!open) setAppointmentToUpdate(null);
          }}
          status={appointmentToUpdate.status}
          appointmentId={appointmentToUpdate.id}
          onStatusUpdated={() => {
            setIsStatusDialogOpen(false);
            setAppointmentToUpdate(null);
            handleDialogClosed(true);
          }}
        />
      )}
      
      {/* Cancel Dialog */}
      {appointmentToCancel && (
        <AppointmentCancelDialog
          isOpen={isCancelDialogOpen}
          onOpenChange={(open) => {
            setIsCancelDialogOpen(open);
            if (!open) {
              setAppointmentToCancel(null);
              setCancelReason('');
            }
          }}
          appointmentId={appointmentToCancel}
          reason={cancelReason}
          onReasonChange={setCancelReason}
          onCanceled={() => {
            setIsCancelDialogOpen(false);
            setAppointmentToCancel(null);
            setCancelReason('');
            handleDialogClosed(true);
          }}
        />
      )}
    </div>
  );
}
