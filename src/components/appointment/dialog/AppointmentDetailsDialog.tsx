
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { ClientDetailsSection } from "./sections/ClientDetailsSection";
import { ServiceDetailsSection } from "./sections/ServiceDetailsSection";
import { AppointmentDetailsSection } from "./sections/AppointmentDetailsSection";
import { DialogActions } from "./actions/DialogActions";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentDetailsDialogProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onShowCancelConfirm: () => void;
  onShowReschedule: () => void;
  onSendWhatsApp: () => void;
  onShowHistory: () => void;
  onShowDeleteConfirm: () => void;
  isUpdatingStatus: boolean;
}

export function AppointmentDetailsDialog({
  appointment,
  isOpen,
  onClose,
  onComplete,
  onShowCancelConfirm,
  onShowReschedule,
  onSendWhatsApp,
  onShowHistory,
  onShowDeleteConfirm,
  isUpdatingStatus
}: AppointmentDetailsDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado": return "bg-blue-500";
      case "concluido": return "bg-green-500";
      default: return "bg-red-500";
    }
  };

  // Format date for display if it's a valid date string
  const formattedDate = appointment.data ? 
    (appointment.data.includes("-") ? 
      format(parseISO(appointment.data), "dd/MM/yyyy", { locale: ptBR }) : 
      appointment.data) : 
    "";

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
          
          <AppointmentDetailsSection 
            data={formattedDate} 
            hora={appointment.hora} 
            profissional={appointment.profissional.nome}
          />
          
          {appointment.status === "cancelado" && appointment.motivo_cancelamento && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">Motivo do Cancelamento:</h4>
                <p className="text-sm text-muted-foreground">{appointment.motivo_cancelamento}</p>
              </div>
            </>
          )}
        </div>
        
        <DialogActions 
          status={appointment.status}
          isUpdatingStatus={isUpdatingStatus}
          onComplete={onComplete}
          onShowCancelConfirm={onShowCancelConfirm}
          onShowReschedule={onShowReschedule}
          onSendWhatsApp={onSendWhatsApp}
          onShowHistory={onShowHistory}
          onShowDeleteConfirm={onShowDeleteConfirm}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
