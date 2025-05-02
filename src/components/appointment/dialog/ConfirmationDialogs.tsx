

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ConfirmationDialogsProps {
  showCancelConfirm: boolean;
  setShowCancelConfirm: (value: boolean) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (value: boolean) => void;
  onCancel: () => void;
  onDelete: () => void;
  cancelReason?: string;
  setCancelReason?: (value: string) => void;
  isLoading?: boolean;
}

export function ConfirmationDialogs({
  showCancelConfirm,
  setShowCancelConfirm,
  showDeleteConfirm,
  setShowDeleteConfirm,
  onCancel,
  onDelete,
  cancelReason = "",
  setCancelReason,
  isLoading = false,
}: ConfirmationDialogsProps) {
  const [localReason, setLocalReason] = useState(cancelReason || "");

  // Sync local state with prop
  useEffect(() => {
    if (cancelReason !== undefined) {
      setLocalReason(cancelReason);
    }
  }, [cancelReason]);

  const handleReasonChange = (value: string) => {
    setLocalReason(value);
    if (setCancelReason) {
      setCancelReason(value);
    }
  };

  const handleCancelSubmit = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  return (
    <>
      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={(open) => !isLoading && setShowCancelConfirm(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O horário ficará disponível para outro cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="cancelReason">Motivo do cancelamento (opcional)</Label>
            <Textarea
              id="cancelReason"
              value={localReason}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder="Informe o motivo do cancelamento"
              className="mt-2"
              disabled={isLoading}
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubmit}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 flex gap-2 items-center"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Cancelar agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => !isLoading && setShowDeleteConfirm(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete();
              }}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 flex gap-2 items-center"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

