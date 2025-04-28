
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
import { AppointmentStatus } from "@/types/appointment.types";
import { Loader2 } from "lucide-react";

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  status: AppointmentStatus | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function StatusUpdateDialog({
  isOpen,
  onOpenChange,
  status,
  onConfirm,
  isLoading = false
}: StatusUpdateDialogProps) {
  if (!status) return null;
  
  const isCompleting = status === "concluido";

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isCompleting ? "Concluir agendamento?" : "Cancelar agendamento?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isCompleting
              ? "Tem certeza que deseja marcar este agendamento como concluído?"
              : "Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={isCompleting
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isCompleting ? "Concluindo..." : "Cancelando..."}
              </>
            ) : (
              isCompleting
                ? "Sim, concluir agendamento" 
                : "Sim, cancelar agendamento"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
