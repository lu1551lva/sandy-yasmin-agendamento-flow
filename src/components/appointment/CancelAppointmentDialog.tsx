
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";

interface CancelAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export function CancelAppointmentDialog({
  isOpen,
  onClose,
  reason,
  onReasonChange,
  onConfirm,
  isLoading
}: CancelAppointmentDialogProps) {
  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
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
