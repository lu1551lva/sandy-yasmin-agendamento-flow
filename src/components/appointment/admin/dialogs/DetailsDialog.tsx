import { format } from "date-fns";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Ban, Check, Trash, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/currencyUtils";
import { IconButton } from "@/components/ui/icon-button";

interface DetailsDialogProps {
  appointment: AppointmentWithDetails | null;
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  onReschedule: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

export function DetailsDialog({
  appointment,
  showDialog,
  setShowDialog,
  onReschedule,
  onCancel,
  onComplete,
  onDelete,
  isLoading
}: DetailsDialogProps) {
  if (!appointment) return null;
  
  // Check if appointment is active (to enable/disable action buttons)
  const isActive = appointment.status === "agendado";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">Agendado</Badge>
            {isActive && (
              <IconButton 
                icon={Check} 
                variant="outline" 
                className="h-6 w-6 border-green-500 hover:bg-green-50 text-green-600"
                onClick={onComplete}
                tooltip="Concluir agendamento"
                disabled={isLoading}
              />
            )}
          </div>
        );
      case "concluido":
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>
            <IconButton 
              icon={RefreshCw} 
              variant="outline" 
              className="h-6 w-6 border-blue-500 hover:bg-blue-50 text-blue-600"
              onClick={onReschedule}
              tooltip="Alterar status"
              disabled={isLoading}
            />
          </div>
        );
      case "cancelado":
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>
            <IconButton 
              icon={RefreshCw} 
              variant="outline" 
              className="h-6 w-6 border-blue-500 hover:bg-blue-50 text-blue-600"
              onClick={onReschedule}
              tooltip="Alterar status"
              disabled={isLoading}
            />
          </div>
        );
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Dialog open={showDialog && !!appointment} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-md md:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            {getStatusBadge(appointment.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cliente */}
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <div className="mt-1 font-medium">{appointment.cliente.nome}</div>
              </div>
              <div>
                <Label>Telefone</Label>
                <div className="mt-1 font-medium">{appointment.cliente.telefone}</div>
              </div>
              <div className="md:col-span-2">
                <Label>Email</Label>
                <div className="mt-1">{appointment.cliente.email}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Serviço */}
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Serviço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Serviço</Label>
                <div className="mt-1 font-medium">{appointment.servico.nome}</div>
              </div>
              <div>
                <Label>Valor</Label>
                <div className="mt-1 font-medium text-primary">{formatCurrency(appointment.servico.valor)}</div>
              </div>
              <div>
                <Label>Duração</Label>
                <div className="mt-1">{appointment.servico.duracao_em_minutos} minutos</div>
              </div>
              <div>
                <Label>Profissional</Label>
                <div className="mt-1">{appointment.profissional.nome}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data e Hora */}
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Data e Hora</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <div className="mt-1 font-medium">{format(new Date(appointment.data), "dd/MM/yyyy")}</div>
              </div>
              <div>
                <Label>Hora</Label>
                <div className="mt-1 font-medium">{appointment.hora}</div>
              </div>
            </div>
          </div>

          {appointment.motivo_cancelamento && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Motivo do Cancelamento</h3>
                <Alert variant="destructive">
                  <AlertDescription>
                    {appointment.motivo_cancelamento}
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {isActive && (
            <>
              <Button 
                className="flex-1" 
                onClick={onReschedule}
                disabled={isLoading || !isActive}
              >
                <Clock className="mr-2 h-4 w-4" />
                Reagendar
              </Button>
              <Button 
                className="flex-1"
                variant="destructive"
                onClick={onCancel}
                disabled={isLoading || !isActive}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                className="flex-1"
                variant="default"
                onClick={onComplete}
                disabled={isLoading || !isActive}
              >
                <Check className="mr-2 h-4 w-4" />
                Concluir
              </Button>
            </>
          )}
          <Button 
            className="flex-1 sm:flex-none"
            variant="outline"
            onClick={onDelete}
            disabled={isLoading}
          >
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
