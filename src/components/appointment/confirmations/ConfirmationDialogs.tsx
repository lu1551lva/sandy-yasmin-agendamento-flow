
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ConfirmationDialogsProps {
  showCancelConfirm: boolean;
  setShowCancelConfirm: (show: boolean) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  onCancel: () => void;
  onDelete: () => void;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  isLoading: boolean;
}

export function ConfirmationDialogs({
  showCancelConfirm,
  setShowCancelConfirm,
  showDeleteConfirm,
  setShowDeleteConfirm,
  onCancel,
  onDelete,
  cancelReason,
  setCancelReason,
  isLoading
}: ConfirmationDialogsProps) {
  return (
    <>
      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={(open) => !isLoading && setShowCancelConfirm(open)}>
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
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Informe o motivo do cancelamento"
              className="mt-2"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isLoading}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={onCancel}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={(open) => !isLoading && setShowDeleteConfirm(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Agendamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir permanentemente este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Exclusão'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
