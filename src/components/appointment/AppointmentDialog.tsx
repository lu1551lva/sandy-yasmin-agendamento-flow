
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AppointmentHistory } from "./AppointmentHistory";
import { ClientDetailsSection } from "./dialog/ClientDetailsSection";
import { ServiceDetailsSection } from "./dialog/ServiceDetailsSection";
import { AppointmentDetailsSection } from "./dialog/AppointmentDetailsSection";
import { DialogActions } from "./dialog/DialogActions";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { ConfirmationDialogs } from "./dialog/ConfirmationDialogs";
import { RescheduleDialog } from "./RescheduleDialog";
import { useAppointmentDialog } from "./hooks/useAppointmentDialog";

interface AppointmentDialogProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated?: () => void;
}

export function AppointmentDialog({ appointment, isOpen, onClose, onAppointmentUpdated }: AppointmentDialogProps) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Detalhes do Agendamento</DialogTitle>
              <Badge
                className={`${appointment.status === "agendado" ? "bg-blue-500" : 
                  appointment.status === "concluido" ? "bg-green-500" : 
                  "bg-red-500"} text-white`}
              >
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
        </DialogContent>
      </Dialog>

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
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Histórico do Agendamento</SheetTitle>
            <SheetDescription>
              Confira o histórico completo deste agendamento.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <AppointmentHistory appointmentId={appointment.id} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
