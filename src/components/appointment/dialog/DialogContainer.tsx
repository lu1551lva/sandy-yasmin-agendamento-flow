
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentDetails } from "./details/AppointmentDetails";
import { AppointmentHistory } from "./history/AppointmentHistory";
import { X } from "lucide-react";
import { DialogActions } from "./actions/DialogActions";
import { DialogConfirmation } from "./confirmations/DialogConfirmation";
import { RescheduleDialog } from "../RescheduleDialog";
import { formatDateTime, formatDateTimeForWhatsApp } from "@/lib/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { useWhatsAppTemplates } from "@/hooks/useWhatsAppTemplates";

interface DialogContainerProps {
  appointment: AppointmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated?: () => void;
}

export function DialogContainer({
  appointment,
  isOpen,
  onClose,
  onAppointmentUpdated = () => {},
}: DialogContainerProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [confirmAction, setConfirmAction] = useState<"complete" | "cancel" | "delete" | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { toast } = useToast();
  const whatsAppTemplates = useWhatsAppTemplates();
  
  // Reset states when dialog closes
  const handleClose = () => {
    setActiveTab("details");
    setConfirmAction(null);
    setIsConfirmDialogOpen(false);
    setIsRescheduleDialogOpen(false);
    setCancelReason("");
    onClose();
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Handle complete button click
  const handleComplete = () => {
    setConfirmAction("complete");
    setIsConfirmDialogOpen(true);
  };
  
  // Handle cancel button click
  const handleCancelConfirm = () => {
    setConfirmAction("cancel");
    setIsConfirmDialogOpen(true);
  };
  
  // Handle reschedule button click
  const handleShowReschedule = () => {
    setIsRescheduleDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteConfirm = () => {
    setConfirmAction("delete");
    setIsConfirmDialogOpen(true);
  };

  // Função para abrir WhatsApp e enviar mensagem de confirmação
  const handleSendWhatsApp = () => {
    if (!appointment.cliente.telefone) {
      toast({
        title: "Erro ao enviar WhatsApp",
        description: "O cliente não possui telefone cadastrado.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Formatar a data para exibição
      const formattedDateTime = formatDateTimeForWhatsApp(appointment.data, appointment.hora);
      
      // Gerar a mensagem de confirmação
      const message = whatsAppTemplates.getAppointmentConfirmationTemplate(
        appointment.cliente.nome,
        appointment.servico.nome,
        formattedDateTime
      );
      
      // Gerar a URL do WhatsApp
      const whatsappURL = whatsAppTemplates.getWhatsAppURL(appointment.cliente.telefone, message);
      
      // Abrir o WhatsApp em uma nova aba
      window.open(whatsappURL, '_blank');
      
      toast({
        title: "WhatsApp",
        description: "Mensagem de confirmação pronta para ser enviada!"
      });
    } catch (error) {
      console.error("Erro ao preparar mensagem do WhatsApp:", error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o WhatsApp. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Handle rescheduling
  const handleReschedule = async (date: Date, time: string) => {
    // Implementação em Reschedule será chamada
    console.log("Reagendamento solicitado para:", date, time);
    return false;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-none">
            <div className="flex items-center justify-between">
              <DialogTitle>Detalhes do Agendamento</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 rounded-full p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              {formatDateTime(appointment.data, appointment.hora)} - {appointment.cliente.nome}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex-grow overflow-hidden flex flex-col"
          >
            <TabsList className="w-full">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent
              value="details"
              className="flex-grow overflow-y-auto"
            >
              <AppointmentDetails appointment={appointment} />
            </TabsContent>

            <TabsContent
              value="history"
              className="flex-grow overflow-y-auto"
            >
              <AppointmentHistory appointmentId={appointment.id} />
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4 flex-none">
            <DialogActions
              status={appointment.status}
              isUpdatingStatus={isUpdatingStatus}
              onComplete={handleComplete}
              onShowCancelConfirm={handleCancelConfirm}
              onShowReschedule={handleShowReschedule}
              onSendWhatsApp={handleSendWhatsApp}
              onShowHistory={() => handleTabChange("history")}
              onShowDeleteConfirm={handleDeleteConfirm}
              onClose={handleClose}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para ações (concluir, cancelar, excluir) */}
      <DialogConfirmation
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        action={confirmAction}
        appointmentId={appointment.id}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onSuccess={() => {
          handleClose();
          onAppointmentUpdated();
        }}
      />

      {/* Diálogo de reagendamento */}
      <RescheduleDialog
        appointment={isRescheduleDialogOpen ? appointment : null}
        isOpen={isRescheduleDialogOpen}
        onClose={() => setIsRescheduleDialogOpen(false)}
        onReschedule={handleReschedule}
        isLoading={false}
      />
    </>
  );
}
