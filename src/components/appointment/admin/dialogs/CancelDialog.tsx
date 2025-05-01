
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CancelDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  onCancel: (reason: string) => void;
  isLoading: boolean;
}

export function CancelDialog({
  showDialog,
  setShowDialog,
  onCancel,
  isLoading
}: CancelDialogProps) {
  const [cancelReason, setCancelReason] = useState("");

  const handleCancel = () => {
    onCancel(cancelReason);
    setCancelReason("");
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar Agendamento</DialogTitle>
          <DialogDescription>
            Informe o motivo do cancelamento (opcional).
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motivo</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Motivo do cancelamento"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isLoading}>
            Voltar
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
            {isLoading ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
