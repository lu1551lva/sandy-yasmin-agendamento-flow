
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  onDelete: () => void;
  isLoading: boolean;
}

export function DeleteDialog({
  showDialog,
  setShowDialog,
  onDelete,
  isLoading
}: DeleteDialogProps) {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir Agendamento</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O agendamento será excluído permanentemente.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isLoading} className="flex-1">
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onDelete} 
            disabled={isLoading} 
            className="flex-1"
          >
            {isLoading ? "Excluindo..." : "Excluir Permanentemente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
