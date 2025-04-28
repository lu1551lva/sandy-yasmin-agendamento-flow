
import { useState } from "react";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { AppointmentStatusSection } from "./list/AppointmentStatusSection";
import { AppointmentDialogs } from "./list/AppointmentDialogs";
import { useAppointmentGrouper } from "./list/AppointmentGrouper";

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
  // State for dialogs and appointment actions
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{ id: string; status: AppointmentStatus } | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  
  // Group appointments by status
  const { groupedAppointments, isEmpty } = useAppointmentGrouper({ 
    appointments, 
    showAll 
  });

  // Handle appointment actions
  const openCancelDialog = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setIsCancelDialogOpen(true);
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
    <>
      <div className="space-y-6">
        {/* Active Appointments */}
        <AppointmentStatusSection
          title="Agendamentos Ativos"
          titleClassName="text-blue-800"
          appointments={groupedAppointments.agendado}
          onShowDetails={setSelectedAppointment}
          onComplete={(id) => setAppointmentToUpdate({ id, status: "concluido" })}
          onCancel={openCancelDialog}
          isLoading={false}
        />
        
        {/* Completed Appointments */}
        <AppointmentStatusSection
          title="Agendamentos Concluídos"
          titleClassName="text-green-800"
          appointments={groupedAppointments.concluido}
          onShowDetails={setSelectedAppointment}
          onComplete={(id) => setAppointmentToUpdate({ id, status: "concluido" })}
          onCancel={openCancelDialog}
          isLoading={false}
        />
        
        {/* Canceled Appointments */}
        <AppointmentStatusSection
          title="Agendamentos Cancelados"
          titleClassName="text-red-800"
          appointments={groupedAppointments.cancelado}
          onShowDetails={setSelectedAppointment}
          onComplete={(id) => setAppointmentToUpdate({ id, status: "concluido" })}
          onCancel={openCancelDialog}
          isLoading={false}
        />
      </div>
      
      {/* Dialogs for appointments */}
      <AppointmentDialogs
        selectedAppointment={selectedAppointment}
        setSelectedAppointment={setSelectedAppointment}
        appointmentToUpdate={appointmentToUpdate}
        setAppointmentToUpdate={setAppointmentToUpdate}
        isCancelDialogOpen={isCancelDialogOpen}
        setIsCancelDialogOpen={setIsCancelDialogOpen}
        appointmentToCancel={appointmentToCancel}
        setAppointmentToCancel={setAppointmentToCancel}
        onAppointmentUpdated={onAppointmentUpdated}
      />
    </>
  );
}
