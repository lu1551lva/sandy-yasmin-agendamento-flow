
import { useState } from "react";
import { AppointmentDialog } from "./AppointmentDialog";
import { Button } from "@/components/ui/button";
import { format, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CalendarClock, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  PhoneCall,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { formatCurrency } from "@/lib/supabase";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { Textarea } from "@/components/ui/textarea";

interface AppointmentListProps {
  appointments: AppointmentWithDetails[];
  onAppointmentUpdated?: () => void;
  showAll?: boolean;
}

export function AppointmentList({ appointments, onAppointmentUpdated, showAll = false }: AppointmentListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{ id: string; status: "concluido" | "cancelado" } | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const { updateStatus, isLoading } = useUpdateAppointmentStatus();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Agendado</Badge>;
      case "concluido":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Concluído</Badge>;
      case "cancelado":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const handleStatusUpdate = async () => {
    if (!appointmentToUpdate) return;
    
    const success = await updateStatus(appointmentToUpdate.id, appointmentToUpdate.status);
    if (success && onAppointmentUpdated) {
      onAppointmentUpdated();
    }
    setAppointmentToUpdate(null);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    const success = await updateStatus(appointmentToCancel, "cancelado", cancelReason);
    if (success && onAppointmentUpdated) {
      onAppointmentUpdated();
    }
    setIsCancelDialogOpen(false);
    setAppointmentToCancel(null);
    setCancelReason("");
  };

  const openCancelDialog = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setIsCancelDialogOpen(true);
  };

  // Filter active appointments unless showAll is true
  const filteredAppointments = showAll 
    ? appointments 
    : appointments.filter(appointment => appointment.status !== "cancelado");

  if (!filteredAppointments || filteredAppointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum agendamento encontrado.
      </div>
    );
  }

  // Group appointments by status for better organization
  const groupedAppointments = {
    agendado: filteredAppointments.filter(app => app.status === "agendado"),
    concluido: filteredAppointments.filter(app => app.status === "concluido"),
    cancelado: filteredAppointments.filter(app => app.status === "cancelado" && showAll),
  };

  return (
    <>
      <div className="space-y-6">
        {/* Agendados */}
        {groupedAppointments.agendado.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-blue-800">Agendamentos Ativos</h3>
            {groupedAppointments.agendado.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-4 border rounded-lg shadow-sm transition-all bg-white hover:bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{appointment.cliente.nome}</h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      <PhoneCall className="h-3.5 w-3.5 inline mr-1" />
                      {appointment.cliente.telefone}
                    </p>
                    
                    <div className="mt-2">
                      <p className="font-medium">{appointment.servico.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(appointment.servico.valor)} • {appointment.servico.duracao_em_minutos} minutos
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 text-right">
                    <div className="space-y-1">
                      <p className="text-sm">
                        {isToday(parseISO(appointment.data)) ? "Hoje" : format(parseISO(appointment.data), "dd/MM/yyyy")}
                      </p>
                      <p className="text-lg font-bold">{appointment.hora}</p>
                      <p className="text-xs text-muted-foreground">Com {appointment.profissional.nome}</p>
                    </div>
                    
                    <div className="mt-3 flex justify-end gap-2">
                      {appointment.status === "agendado" && !isLoading && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => setAppointmentToUpdate({
                              id: appointment.id,
                              status: "concluido"
                            })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Concluir
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => openCancelDialog(appointment.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      )}

                      {isLoading && (
                        <Button size="sm" variant="outline" disabled>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Atualizando...
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        Detalhes <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Concluídos */}
        {groupedAppointments.concluido.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-800">Agendamentos Concluídos</h3>
            {groupedAppointments.concluido.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-4 border rounded-lg shadow-sm transition-all bg-green-50 border-green-200"
              >
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{appointment.cliente.nome}</h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      <PhoneCall className="h-3.5 w-3.5 inline mr-1" />
                      {appointment.cliente.telefone}
                    </p>
                    
                    <div className="mt-2">
                      <p className="font-medium">{appointment.servico.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(appointment.servico.valor)} • {appointment.servico.duracao_em_minutos} minutos
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 text-right">
                    <div className="space-y-1">
                      <p className="text-sm">
                        {isToday(parseISO(appointment.data)) ? "Hoje" : format(parseISO(appointment.data), "dd/MM/yyyy")}
                      </p>
                      <p className="text-lg font-bold">{appointment.hora}</p>
                      <p className="text-xs text-muted-foreground">Com {appointment.profissional.nome}</p>
                    </div>
                    
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        Detalhes <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Cancelados - Só mostrar se showAll estiver ativo */}
        {groupedAppointments.cancelado.length > 0 && showAll && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-red-800">Agendamentos Cancelados</h3>
            {groupedAppointments.cancelado.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-4 border rounded-lg shadow-sm transition-all bg-red-50 border-red-200"
              >
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{appointment.cliente.nome}</h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      <PhoneCall className="h-3.5 w-3.5 inline mr-1" />
                      {appointment.cliente.telefone}
                    </p>
                    
                    <div className="mt-2">
                      <p className="font-medium">{appointment.servico.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(appointment.servico.valor)} • {appointment.servico.duracao_em_minutos} minutos
                      </p>
                    </div>
                    {appointment.motivo_cancelamento && (
                      <div className="mt-2 text-red-700 text-sm">
                        <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
                        Motivo: {appointment.motivo_cancelamento}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-0 text-right">
                    <div className="space-y-1">
                      <p className="text-sm">
                        {isToday(parseISO(appointment.data)) ? "Hoje" : format(parseISO(appointment.data), "dd/MM/yyyy")}
                      </p>
                      <p className="text-lg font-bold">{appointment.hora}</p>
                      <p className="text-xs text-muted-foreground">Com {appointment.profissional.nome}</p>
                    </div>
                    
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        Detalhes <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedAppointment && (
        <AppointmentDialog
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onAppointmentUpdated={onAppointmentUpdated}
        />
      )}

      {/* Diálogo de Confirmação para Concluir */}
      <AlertDialog open={!!appointmentToUpdate} onOpenChange={() => setAppointmentToUpdate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {appointmentToUpdate?.status === "concluido" 
                ? "Concluir agendamento?" 
                : "Cancelar agendamento?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {appointmentToUpdate?.status === "concluido"
                ? "Tem certeza que deseja marcar este agendamento como concluído?"
                : "Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              className={appointmentToUpdate?.status === "concluido" 
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"}
            >
              {appointmentToUpdate?.status === "concluido" 
                ? "Sim, concluir agendamento" 
                : "Sim, cancelar agendamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para cancelar com motivo */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar agendamento</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo do cancelamento (opcional).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Cliente faltou, reagendamento solicitado, etc."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirmar cancelamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
