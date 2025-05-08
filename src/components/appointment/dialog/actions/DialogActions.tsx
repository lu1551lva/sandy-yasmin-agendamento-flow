
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { AppointmentStatus } from "@/types/appointment.types";
import { CheckCircle, XCircle, CalendarPlus, Phone, History, Trash2, RefreshCw } from "lucide-react";

interface DialogActionsProps {
  status: AppointmentStatus;
  isUpdatingStatus: boolean;
  onComplete: () => void;
  onShowCancelConfirm: () => void;
  onShowReschedule: () => void;
  onSendWhatsApp: () => void;
  onShowHistory: () => void;
  onShowDeleteConfirm: () => void;
  onClose: () => void;
}

export function DialogActions({
  status,
  isUpdatingStatus,
  onComplete,
  onShowCancelConfirm,
  onShowReschedule,
  onSendWhatsApp,
  onShowHistory,
  onShowDeleteConfirm,
  onClose,
}: DialogActionsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 w-full">
      {/* Ações principais - mostrar apenas para agendamentos não cancelados */}
      {status === "agendado" && (
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="default" 
            onClick={onComplete}
            disabled={isUpdatingStatus}
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Concluir
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onShowCancelConfirm}
            disabled={isUpdatingStatus}
            className="text-red-500 border-red-500 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2" /> Cancelar
          </Button>
        </div>
      )}
      
      {/* Mostrar botão para reagendar mesmo para agendamentos concluídos ou cancelados */}
      {status !== "agendado" && (
        <div className="grid grid-cols-1 gap-3">
          <Button 
            variant="default" 
            onClick={onShowReschedule}
            disabled={isUpdatingStatus}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Alterar Status
          </Button>
        </div>
      )}
      
      {/* Ações secundárias */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button 
          variant="outline" 
          onClick={onShowReschedule}
          disabled={status === 'cancelado'}
        >
          <CalendarPlus className="h-4 w-4 mr-2" /> Reagendar
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onSendWhatsApp}
        >
          <Phone className="h-4 w-4 mr-2" /> WhatsApp
        </Button>

        <Button 
          variant="outline" 
          onClick={onShowHistory}
        >
          <History className="h-4 w-4 mr-2" /> Histórico
        </Button>
      </div>

      {/* Ações de controle */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={onShowDeleteConfirm}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Excluir
        </Button>
        
        <Button variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
}
