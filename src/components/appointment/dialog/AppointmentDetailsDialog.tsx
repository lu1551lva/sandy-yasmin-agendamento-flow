
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { Calendar, Check, Clock, History, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppointmentDetailsSection } from "./AppointmentDetailsSection";
import { CustomerDetailsSection } from "./CustomerDetailsSection";
import { ServiceDetailsSection } from "./sections/ServiceDetailsSection";
import { CancellationDetailsSection } from "./CancellationDetailsSection";

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
  isUpdatingStatus?: boolean;
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
  isUpdatingStatus = false,
}: AppointmentDetailsDialogProps) {
  if (!appointment) return null;

  const isActive = appointment.status === "agendado";
  const isCompleted = appointment.status === "concluido";
  const isCanceled = appointment.status === "cancelado";
  
  const getStatusBadge = () => {
    if (isActive) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Agendado</Badge>;
    } else if (isCompleted) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Concluído</Badge>;
    } else if (isCanceled) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
    }
    
    return <Badge variant="outline">Desconhecido</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex flex-row justify-between items-center">
            <DialogTitle>Detalhes do agendamento</DialogTitle>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Appointment Details Section */}
          <AppointmentDetailsSection 
            data={appointment.data}
            hora={appointment.hora}
            profissional={appointment.profissional.nome}
          />
          
          <Separator />
          
          {/* Customer Details Section */}
          <CustomerDetailsSection cliente={appointment.cliente} />
          
          <Separator />
          
          {/* Service Details Section */}
          <ServiceDetailsSection servico={appointment.servico} />
          
          {/* Show cancellation details if appointment is cancelled */}
          {isCanceled && appointment.motivo_cancelamento && (
            <>
              <Separator />
              <CancellationDetailsSection motivo={appointment.motivo_cancelamento} />
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {/* Show WhatsApp button for all statuses */}
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onSendWhatsApp}
              disabled={isUpdatingStatus}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onShowHistory}
              disabled={isUpdatingStatus}
            >
              <History className="h-4 w-4 mr-2" />
              Histórico
            </Button>
          </div>

          <Separator className="sm:hidden" />
          
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {/* Show delete button for all statuses */}
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={onShowDeleteConfirm}
              disabled={isUpdatingStatus}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            
            {/* Show Reschedule/Cancel/Complete buttons only for active appointments */}
            {isActive && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onShowReschedule}
                  disabled={isUpdatingStatus}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Reagendar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onShowCancelConfirm}
                  disabled={isUpdatingStatus}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={onComplete}
                  disabled={isUpdatingStatus}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Concluir
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
