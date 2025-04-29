
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentStatusSection } from "./list/AppointmentStatusSection";
import { AppointmentDialogs } from "./list/AppointmentDialogs";
import { useAppointmentGrouper } from "./list/AppointmentGrouper";
import { AppointmentDialogProvider, useAppointmentDialog } from "./context/AppointmentDialogContext";

interface AppointmentListProps {
  appointments: AppointmentWithDetails[];
  onAppointmentUpdated?: () => void;
  showAll?: boolean;
}

// Internal component that uses the context
function AppointmentListContent({
  appointments,
  showAll = false
}: Omit<AppointmentListProps, 'onAppointmentUpdated'>) {
  const { 
    openAppointmentDetails, 
    openStatusUpdateDialog,
    openCancelDialog,
    isLoading
  } = useAppointmentDialog();

  // Group appointments by status - using appointments directly from props
  const { groupedAppointments, isEmpty } = useAppointmentGrouper({ 
    appointments, 
    showAll 
  });

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
        onShowDetails={openAppointmentDetails}
        onComplete={(id) => openStatusUpdateDialog(id, "concluido")}
        onCancel={openCancelDialog}
        isLoading={isLoading}
      />
      
      {/* Completed Appointments */}
      {showAll && groupedAppointments.concluido.length > 0 && (
        <AppointmentStatusSection
          title="Agendamentos Concluídos"
          titleClassName="text-green-800"
          appointments={groupedAppointments.concluido}
          onShowDetails={openAppointmentDetails}
          onComplete={(id) => openStatusUpdateDialog(id, "concluido")}
          onCancel={openCancelDialog}
          isLoading={isLoading}
        />
      )}
      
      {/* Canceled Appointments */}
      {showAll && groupedAppointments.cancelado.length > 0 && (
        <AppointmentStatusSection
          title="Agendamentos Cancelados"
          titleClassName="text-red-800"
          appointments={groupedAppointments.cancelado}
          onShowDetails={openAppointmentDetails}
          onComplete={(id) => openStatusUpdateDialog(id, "concluido")}
          onCancel={openCancelDialog}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Main export component that provides the context
export function AppointmentList({ 
  appointments, 
  onAppointmentUpdated = () => {}, 
  showAll = false 
}: AppointmentListProps) {
  return (
    <AppointmentDialogProvider onAppointmentUpdated={onAppointmentUpdated}>
      <AppointmentListContent appointments={appointments} showAll={showAll} />
      <AppointmentDialogs onAppointmentUpdated={onAppointmentUpdated} />
    </AppointmentDialogProvider>
  );
}
