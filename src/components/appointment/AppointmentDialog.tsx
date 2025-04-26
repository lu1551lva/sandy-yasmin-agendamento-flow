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
import { CheckCircle, Clock, User, Phone, Mail, CalendarDays, XCircle } from "lucide-react";
import { createWhatsAppLink, formatCurrency } from "@/lib/supabase";
import { RescheduleDialog } from "@/components/appointment/RescheduleDialog";
import { useRescheduleAppointment } from "@/hooks/useRescheduleAppointment";

interface AppointmentDialogProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  agendado: "bg-blue-500 text-white",
  concluido: "bg-green-500 text-white",
  cancelado: "bg-red-500 text-white",
};

export function AppointmentDialog({ appointment, isOpen, onClose }: AppointmentDialogProps) {
  const [showReschedule, setShowReschedule] = useState(false);
  const { rescheduleAppointment, isLoading } = useRescheduleAppointment();

  const handleReschedule = async (date: Date, time: string) => {
    const success = await rescheduleAppointment(
      appointment.id,
      date,
      time,
      appointment.profissional.id
    );

    if (success) {
      setShowReschedule(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
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
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${statusColors[appointment.status]
                    }`}
                >
                  {appointment.status === "agendado" && <Clock className="h-4 w-4 mr-1" />}
                  {appointment.status === "concluido" && <CheckCircle className="h-4 w-4 mr-1" />}
                  {appointment.status === "cancelado" && <XCircle className="h-4 w-4 mr-1" />}
                  {appointment.status}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              
              <Button 
                variant="outline" 
                onClick={() => setShowReschedule(true)}
                disabled={appointment.status === 'cancelado'}
              >
                Reagendar
              </Button>
            </div>
            
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showReschedule && (
        <RescheduleDialog
          appointment={appointment}
          isOpen={showReschedule}
          onClose={() => setShowReschedule(false)}
          onReschedule={handleReschedule}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
