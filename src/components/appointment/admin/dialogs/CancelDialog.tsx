
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CancelDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  onCancel: (reason: string) => void;
  cancelReason?: string;
  setCancelReason?: (reason: string) => void;
  isLoading: boolean;
}

export function CancelDialog({
  showDialog,
  setShowDialog,
  onCancel,
  cancelReason = "",
  setCancelReason,
  isLoading
}: CancelDialogProps) {
  const [localReason, setLocalReason] = useState(cancelReason);

  // Use state syncing if external state management is provided
  useEffect(() => {
    if (setCancelReason) {
      setLocalReason(cancelReason);
    }
  }, [cancelReason, setCancelReason]);

  const handleReasonChange = (value: string) => {
    setLocalReason(value);
    if (setCancelReason) {
      setCancelReason(value);
    }
  };

  const handleCancel = () => {
    onCancel(localReason || "Cancelamento sem motivo especificado");
  };
  
  return (
    <Dialog open={showDialog} onOpenChange={(open) => !isLoading && setShowDialog(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Agendamento</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar este agendamento?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="cancelReason">Motivo do cancelamento (opcional)</Label>
          <Textarea
            id="cancelReason"
            value={localReason}
            onChange={(e) => handleReasonChange(e.target.value)}
            placeholder="Informe o motivo do cancelamento"
            className="mt-2"
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDialog(false)}
            disabled={isLoading}
          >
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar Cancelamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
