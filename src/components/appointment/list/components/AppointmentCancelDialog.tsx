
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, XCircle } from "lucide-react";
import { 
  logAppointmentAction, 
  logAppointmentError, 
  validateAppointmentId 
} from "@/utils/debugUtils";

interface AppointmentCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
  appointmentId: string | null;
}

export function AppointmentCancelDialog({
  isOpen,
  onClose,
  reason,
  onReasonChange,
  onConfirm,
  isLoading,
  appointmentId
}: AppointmentCancelDialogProps) {
  // Don't render the dialog if there is no appointment ID
  if (!appointmentId || !validateAppointmentId(appointmentId)) {
    return null;
  }

  // Log action and validate before confirming
  const handleConfirm = () => {
    // Double-check appointmentId before proceeding
    if (!validateAppointmentId(appointmentId)) {
      logAppointmentError("Tentativa de cancelar agendamento com ID inválido", appointmentId || "null");
      onClose();
      return;
    }
    
    logAppointmentAction("Confirmando cancelamento em AppointmentCancelDialog", appointmentId, {
      motivo: reason || 'Cancelamento sem motivo especificado'
    });
    
    // Execute the cancel action
    onConfirm();
  };

  return (
    <Dialog 
      open={isOpen && !!appointmentId} 
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar agendamento</DialogTitle>
          <DialogDescription>
            Por favor, informe o motivo do cancelamento (opcional).
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Ex: Cliente faltou, reagendamento solicitado, etc."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="h-24"
          />
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            aria-label="Fechar diálogo de cancelamento"
          >
            Voltar
          </Button>

          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Confirmar cancelamento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
