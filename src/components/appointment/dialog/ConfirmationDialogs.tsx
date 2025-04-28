
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

interface ConfirmationDialogsProps {
  showCancelConfirm: boolean;
  setShowCancelConfirm: (value: boolean) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (value: boolean) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function ConfirmationDialogs({
  showCancelConfirm,
  setShowCancelConfirm,
  showDeleteConfirm,
  setShowDeleteConfirm,
  onCancel,
  onDelete,
}: ConfirmationDialogsProps) {
  return (
    <>
      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O horário ficará disponível para outro cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCancelConfirm(false);
                onCancel();
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Cancelar agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete();
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
