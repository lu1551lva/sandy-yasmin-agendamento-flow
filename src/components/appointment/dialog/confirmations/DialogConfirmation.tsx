
import { useState } from "react";
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
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useToast } from "@/hooks/use-toast";

interface DialogConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  action: "complete" | "cancel" | "delete" | null;
  appointmentId: string;
  reason: string;
  onReasonChange: (reason: string) => void;
  onSuccess: () => void;
}

export function DialogConfirmation({
  isOpen,
  onOpenChange,
  action,
  appointmentId,
  reason,
  onReasonChange,
  onSuccess,
}: DialogConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateStatus, deleteAppointment } = useUpdateAppointmentStatus();
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!action || !appointmentId) return;
    
    setIsLoading(true);
    
    try {
      let success = false;
      
      if (action === "complete") {
        success = await updateStatus(appointmentId, "concluido");
      } else if (action === "cancel") {
        success = await updateStatus(appointmentId, "cancelado", reason);
      } else if (action === "delete") {
        success = await deleteAppointment(appointmentId);
      }
      
      if (success) {
        console.log(`Ação ${action} concluída com sucesso para o agendamento ${appointmentId}`);
        onOpenChange(false);
        onSuccess();
      } else {
        throw new Error(`Falha ao ${getActionName(action)} o agendamento`);
      }
    } catch (error) {
      console.error(`Erro ao processar ação ${action}:`, error);
      toast({
        title: `Erro ao ${getActionName(action)}`,
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActionName = (action: "complete" | "cancel" | "delete" | null): string => {
    switch (action) {
      case "complete": return "concluir";
      case "cancel": return "cancelar";
      case "delete": return "excluir";
      default: return "";
    }
  };

  const getTitle = () => {
    switch (action) {
      case "complete": return "Concluir agendamento?";
      case "cancel": return "Cancelar agendamento?";
      case "delete": return "Excluir agendamento?";
      default: return "";
    }
  };

  const getDescription = () => {
    switch (action) {
      case "complete": return "Tem certeza que deseja marcar este agendamento como concluído?";
      case "cancel": return "Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.";
      case "delete": return "Tem certeza que deseja excluir este agendamento permanentemente? Esta ação não pode ser desfeita.";
      default: return "";
    }
  };

  const getButtonColor = () => {
    switch (action) {
      case "complete": return "bg-green-600 hover:bg-green-700";
      case "cancel": return "bg-amber-600 hover:bg-amber-700";
      case "delete": return "bg-red-600 hover:bg-red-700";
      default: return "";
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      switch (action) {
        case "complete": return "Concluindo...";
        case "cancel": return "Cancelando...";
        case "delete": return "Excluindo...";
        default: return "Processando...";
      }
    } else {
      switch (action) {
        case "complete": return "Sim, concluir agendamento";
        case "cancel": return "Sim, cancelar agendamento";
        case "delete": return "Sim, excluir agendamento";
        default: return "Confirmar";
      }
    }
  };

  if (!action) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>
        
        {action === "cancel" && (
          <div className="py-2">
            <Label htmlFor="cancelReason" className="mb-2 block">Motivo do cancelamento (opcional):</Label>
            <Textarea
              id="cancelReason"
              placeholder="Informe o motivo do cancelamento"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full"
            />
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={getButtonColor()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
