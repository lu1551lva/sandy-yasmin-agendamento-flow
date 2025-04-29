
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { ClientDetailsSection } from "./sections/ClientDetailsSection";
import { ServiceDetailsSection } from "./sections/ServiceDetailsSection";
import { AppointmentDetailsSection } from "./sections/AppointmentDetailsSection";
import { DialogActions } from "./actions/DialogActions";
import { useAppointmentDialog } from "../hooks/useAppointmentDialog";
import { useState } from "react";

interface AppointmentDetailsDialogProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated?: () => void;
}

export function AppointmentDetailsDialog({
  appointment,
  isOpen,
  onClose,
  onAppointmentUpdated
}: AppointmentDetailsDialogProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { 
    handleReschedule,
    handleStatusUpdate,
    handleDelete,
    handleSendWhatsApp,
    isRescheduling,
    isUpdatingStatus,
    isDeleting
  } = useAppointmentDialog({
    appointment,
    onAppointmentUpdated,
    onClose,
    setShowReschedule
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado": return "bg-blue-500";
      case "concluido": return "bg-green-500";
      default: return "bg-red-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <Badge className={`${getStatusColor(appointment.status)} text-white`}>
              {appointment.status === "agendado" ? "Agendado" : 
               appointment.status === "concluido" ? "Concluído" : "Cancelado"}
            </Badge>
          </div>
          <DialogDescription>
            Informações completas sobre este agendamento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <ClientDetailsSection cliente={appointment.cliente} />
          <Separator />
          <ServiceDetailsSection servico={appointment.servico} />
          <Separator />
          <AppointmentDetailsSection data={appointment.data} hora={appointment.hora} />
        </div>
        
        <DialogActions 
          status={appointment.status}
          isUpdatingStatus={isUpdatingStatus}
          onComplete={() => handleStatusUpdate('concluido')}
          onShowCancelConfirm={() => setShowCancelConfirm(true)}
          onShowReschedule={() => setShowReschedule(true)}
          onSendWhatsApp={handleSendWhatsApp}
          onShowHistory={() => setShowHistory(true)}
          onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
          onClose={onClose}
        />

        {/* As janelas de diálogo de confirmação e histórico serão importadas em outro componente */}
      </DialogContent>
    </Dialog>
  );
}
