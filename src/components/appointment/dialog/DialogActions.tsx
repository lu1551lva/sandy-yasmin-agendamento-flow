
import { AppointmentWithDetails } from "@/types/appointment.types";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ClipboardCheck, Calendar, X } from "lucide-react";
import { Loader2 } from "lucide-react";

interface DialogActionsProps {
  appointment: AppointmentWithDetails;
  onRescheduleClick: () => void;
  onComplete: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function DialogActions({ 
  appointment, 
  onRescheduleClick, 
  onComplete, 
  onCancel,
  isLoading 
}: DialogActionsProps) {
  const isActive = appointment.status === "agendado";

  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-2">
      {isActive ? (
        <>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onRescheduleClick}
            disabled={isLoading || !isActive}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            Reagendar
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={onCancel}
            disabled={isLoading || !isActive}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            Cancelar
          </Button>
          <Button
            variant="default"
            className="w-full sm:w-auto"
            onClick={onComplete}
            disabled={isLoading || !isActive}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ClipboardCheck className="h-4 w-4 mr-2" />
            )}
            Concluir
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Este agendamento está {appointment.status === "concluido" ? "concluído" : "cancelado"}.
        </p>
      )}
    </DialogFooter>
  );
}
