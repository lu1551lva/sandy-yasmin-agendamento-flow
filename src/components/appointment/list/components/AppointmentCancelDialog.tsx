
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
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useState } from "react";

interface AppointmentCancelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  reason: string;
  onReasonChange: (reason: string) => void;
  onCanceled: () => void;
}

export function AppointmentCancelDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  reason,
  onReasonChange,
  onCanceled
}: AppointmentCancelDialogProps) {
  const { updateStatus, isLoading } = useUpdateAppointmentStatus();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleCancel = async () => {
    if (!appointmentId) return;
    
    setIsUpdating(true);
    console.log(`Canceling appointment ${appointmentId} with reason: ${reason}`);
    
    try {
      const reasonToUse = reason || "Cancelamento sem motivo especificado";
      const success = await updateStatus(appointmentId, "cancelado", reasonToUse);
      
      if (success) {
        console.log("Appointment canceled successfully");
        onCanceled();
      } else {
        console.error("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only allow closing if not loading
        if (!(isLoading || isUpdating) || !open) {
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
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="h-24"
          />
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading || isUpdating}
          >
            Voltar
          </Button>

          <Button 
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading || isUpdating}
          >
            {isLoading || isUpdating ? (
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
