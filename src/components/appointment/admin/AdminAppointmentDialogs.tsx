
import { useState } from "react";
import { format } from "date-fns";
import { useAppointmentActions } from "@/hooks/appointment/useAppointmentActions";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Check, Ban, Clock, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currencyUtils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminAppointmentDialogsProps {
  appointment: AppointmentWithDetails | null;
  showDetailsDialog: boolean;
  setShowDetailsDialog: (value: boolean) => void;
  showCancelDialog: boolean;
  setShowCancelDialog: (value: boolean) => void;
  showRescheduleDialog: boolean;
  setShowRescheduleDialog: (value: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (value: boolean) => void;
  onAppointmentUpdated: () => void;
}

export function AdminAppointmentDialogs({
  appointment,
  showDetailsDialog,
  setShowDetailsDialog,
  showCancelDialog,
  setShowCancelDialog,
  showRescheduleDialog,
  setShowRescheduleDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  onAppointmentUpdated,
}: AdminAppointmentDialogsProps) {
  const { isLoading, completeAppointment, cancelAppointment, rescheduleAppointment, deleteAppointment } = useAppointmentActions();

  // State for cancel dialog
  const [cancelReason, setCancelReason] = useState("");

  // State for reschedule dialog
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const timeSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
                     "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
                     "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];

  // Handler for appointments actions
  const handleCompleteAppointment = async () => {
    if (!appointment) return;
    
    const success = await completeAppointment(appointment.id);
    if (success) {
      onAppointmentUpdated();
      setShowDetailsDialog(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;
    
    const success = await cancelAppointment(appointment.id, cancelReason);
    if (success) {
      onAppointmentUpdated();
      setShowCancelDialog(false);
      setShowDetailsDialog(false);
      setCancelReason("");
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!appointment || !rescheduleDate || !rescheduleTime) return;
    
    const formattedDate = format(rescheduleDate, "yyyy-MM-dd");
    const success = await rescheduleAppointment(appointment.id, formattedDate, rescheduleTime);
    
    if (success) {
      onAppointmentUpdated();
      setShowRescheduleDialog(false);
      setShowDetailsDialog(false);
      setRescheduleDate(undefined);
      setRescheduleTime("");
    }
  };

  const handleDeleteAppointment = async () => {
    if (!appointment) return;
    
    const success = await deleteAppointment(appointment.id);
    if (success) {
      onAppointmentUpdated();
      setShowDeleteDialog(false);
      setShowDetailsDialog(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Agendado</Badge>;
      case "concluido":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
      case "cancelado":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  // Check if appointment is active (to enable/disable action buttons)
  const isActive = appointment?.status === "agendado";

  return (
    <>
      {/* Details Dialog */}
      <Dialog open={showDetailsDialog && !!appointment} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md md:max-w-2xl">
          {appointment && (
            <>
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
                      onClick={() => setShowRescheduleDialog(true)}
                      disabled={isLoading || !isActive}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Reagendar
                    </Button>
                    <Button 
                      className="flex-1"
                      variant="destructive"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={isLoading || !isActive}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1"
                      variant="default"
                      onClick={handleCompleteAppointment}
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
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog && !!appointment} onOpenChange={setShowCancelDialog}>
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
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isLoading}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment} disabled={isLoading}>
              {isLoading ? "Cancelando..." : "Confirmar Cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog && !!appointment} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reagendar</DialogTitle>
            <DialogDescription>
              Escolha uma nova data e horário para o agendamento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nova Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !rescheduleDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDate ? format(rescheduleDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Novo Horário</Label>
              <Select
                value={rescheduleTime}
                onValueChange={setRescheduleTime}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleRescheduleAppointment} 
              disabled={isLoading || !rescheduleDate || !rescheduleTime}
            >
              {isLoading ? "Reagendando..." : "Confirmar Reagendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog && !!appointment} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Agendamento</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O agendamento será excluído permanentemente.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isLoading} className="flex-1">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAppointment} 
              disabled={isLoading} 
              className="flex-1"
            >
              {isLoading ? "Excluindo..." : "Excluir Permanentemente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
