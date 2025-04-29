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
import { logAppointmentAction } from "@/utils/debugUtils";

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
  isLoading,
}: CancelAppointmentDialogProps) {
  const handleConfirm = () => {
    logAppointmentAction('Executando cancelamento com motivo', 'dialog', reason);
    onConfirm(reason);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onReasonChange(''); // Limpa o motivo ao fechar
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
