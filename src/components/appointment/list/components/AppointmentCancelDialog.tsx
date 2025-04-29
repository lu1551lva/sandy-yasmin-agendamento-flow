
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
import { useAppointmentDialog } from "../../context/AppointmentDialogContext";

interface AppointmentCancelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentCancelDialog({
  isOpen,
  onOpenChange,
}: AppointmentCancelDialogProps) {
  const { 
    appointmentToCancel, 
    cancelReason, 
    setCancelReason,
    handleCancel, 
    isLoading,
    validateAppointmentExists
  } = useAppointmentDialog();

  // Don't render the dialog if there is no appointment ID or ID is invalid
  if (!appointmentToCancel || !validateAppointmentExists(appointmentToCancel)) {
    return null;
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only allow closing if not loading
        if (!isLoading || !open) {
          onOpenChange(open);
        }
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
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="h-24"
          />
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
            aria-label="Fechar diálogo de cancelamento"
          >
            Voltar
          </Button>

          <Button 
            variant="destructive"
            onClick={async () => {
              const success = await handleCancel();
              if (success) {
                onOpenChange(false);
              }
            }}
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
