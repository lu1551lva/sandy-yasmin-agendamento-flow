import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { AppointmentStatus } from "@/types/appointment.types";
import { createWhatsAppLink } from "@/lib/supabase";
import { RescheduleDialog } from "@/components/appointment/RescheduleDialog";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AppointmentHistory } from "./AppointmentHistory";
import { ClientDetailsSection } from "./dialog/ClientDetailsSection";
import { ServiceDetailsSection } from "./dialog/ServiceDetailsSection";
import { AppointmentDetailsSection } from "./dialog/AppointmentDetailsSection";
import { DialogActions } from "./dialog/DialogActions";

interface AppointmentDialogProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated?: () => void;
}

export function AppointmentDialog({ appointment, isOpen, onClose, onAppointmentUpdated }: AppointmentDialogProps) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { rescheduleAppointment, isLoading: isRescheduling } = useRescheduleAppointment();
  const { updateStatus, isLoading: isUpdatingStatus, deleteAppointment, isLoading: isDeleting } = useUpdateAppointmentStatus();
  const { toast } = useToast();

  const handleReschedule = async (date: Date, time: string) => {
    const success = await rescheduleAppointment(
      appointment.id,
      date,
      time,
      appointment.profissional.id
    );

    if (success) {
      setShowReschedule(false);
      toast({
        title: "Agendamento reagendado",
        description: "O agendamento foi reagendado com sucesso.",
      });
      if (onAppointmentUpdated) onAppointmentUpdated();
      onClose();
    }
  };

  const handleStatusUpdate = async (status: AppointmentStatus) => {
    const success = await updateStatus(appointment.id, status);
    
    if (success) {
      toast({
        title: status === 'concluido' ? "Agendamento concluído" : "Agendamento cancelado",
        description: status === 'concluido' 
          ? "O agendamento foi marcado como concluído."
          : "O agendamento foi cancelado com sucesso.",
      });
      
      if (onAppointmentUpdated) onAppointmentUpdated();
      onClose();
    }
  };

  const handleDelete = async () => {
    const success = await deleteAppointment(appointment.id);
    
    if (success) {
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído permanentemente.",
      });
      
      if (onAppointmentUpdated) onAppointmentUpdated();
      onClose();
    }
  };

  const handleSendWhatsApp = () => {
    const message = `Olá ${appointment.cliente.nome.split(' ')[0]}! Confirmamos seu agendamento para ${appointment.servico.nome} no dia ${format(parseISO(appointment.data), "dd/MM", { locale: ptBR })} às ${appointment.hora}.`;
    window.open(createWhatsAppLink(appointment.cliente.telefone, message), "_blank");
  };

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
          
          <DialogFooter className="flex flex-col gap-4 mt-4">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O horário ficará disponível para outro cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCancelConfirm(false);
                handleStatusUpdate('cancelado');
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Cancelar agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirm(false);
                handleDelete();
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
