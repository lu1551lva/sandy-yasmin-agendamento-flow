
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { AppointmentStatus } from "@/types/appointment.types";
import { CheckCircle, Clock, User, Phone, Mail, CalendarDays, XCircle, CalendarPlus, Edit, Trash2, History } from "lucide-react";
import { createWhatsAppLink, formatCurrency } from "@/lib/supabase";
import { RescheduleDialog } from "@/components/appointment/RescheduleDialog";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AppointmentHistory } from "./AppointmentHistory";

interface AppointmentDialogProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated?: () => void;
}

const statusColors = {
  agendado: "bg-blue-500 text-white",
  concluido: "bg-green-500 text-white",
  cancelado: "bg-red-500 text-white",
};

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
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Cliente</h3>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <p>{appointment.cliente.nome}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href={`tel:${appointment.cliente.telefone}`} className="hover:underline">
                  {appointment.cliente.telefone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${appointment.cliente.email}`} className="hover:underline">
                  {appointment.cliente.email}
                </a>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Serviço</h3>
              <p>{appointment.servico.nome}</p>
              <p className="text-sm text-muted-foreground">
                Valor: {formatCurrency(appointment.servico.valor)}
              </p>
              <p className="text-sm text-muted-foreground">
                Duração: {appointment.servico.duracao_em_minutos} minutos
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Agendamento</h3>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <p>
                  {format(parseISO(appointment.data), "dd 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <p>Horário: {appointment.hora}</p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col space-y-2">
            <div className="grid grid-cols-2 gap-2 w-full">
              {appointment.status === "agendado" && (
                <>
                  <Button 
                    variant="default" 
                    onClick={() => handleStatusUpdate('concluido')}
                    disabled={isUpdatingStatus}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Concluir
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isUpdatingStatus}
                    className="w-full text-red-500 border-red-500 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Cancelar
                  </Button>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowReschedule(true)}
                disabled={appointment.status === 'cancelado'}
                className="w-full"
              >
                <CalendarPlus className="h-4 w-4 mr-2" /> Reagendar
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleSendWhatsApp()}
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" /> WhatsApp
              </Button>

              <Button 
                variant="outline" 
                onClick={() => setShowHistory(true)}
                className="w-full"
              >
                <History className="h-4 w-4 mr-2" /> Histórico
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </Button>
              
              <Button variant="ghost" onClick={onClose} className="w-full">
                Fechar
              </Button>
            </div>
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
