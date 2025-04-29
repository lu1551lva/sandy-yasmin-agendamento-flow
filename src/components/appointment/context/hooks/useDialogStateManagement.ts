
import { useState, useCallback } from "react";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { logUIEvent, logAppointmentError } from "@/utils/debugUtils";
import { useToast } from "@/hooks/use-toast";

export function useDialogStateManagement() {
  // Dialog state
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{ id: string; status: AppointmentStatus } | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Helper function to validate appointment ID
  const validateAppointmentExists = useCallback((id: string | null): boolean => {
    if (!id) {
      logAppointmentError('ID de agendamento nulo ou indefinido', 'null');
      return false;
    }
    return true;
  }, []);

  // Dialog control functions
  const openAppointmentDetails = useCallback((appointment: AppointmentWithDetails) => {
    if (!appointment || !validateAppointmentExists(appointment.id)) {
      logAppointmentError('Tentativa de abrir detalhes com agendamento inválido', appointment?.id || 'null');
      return;
    }
    
    logUIEvent('Opening appointment details dialog', appointment.id);
    setSelectedAppointment(appointment);
  }, [validateAppointmentExists]);

  const closeAppointmentDetails = useCallback(() => {
    logUIEvent('Closing appointment details dialog');
    setSelectedAppointment(null);
  }, []);

  const openStatusUpdateDialog = useCallback((id: string, status: AppointmentStatus) => {
    if (!validateAppointmentExists(id)) {
      logAppointmentError('Tentativa de atualizar status com ID inválido', id || 'null');
      toast({
        title: 'Erro na operação',
        description: 'ID de agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    logUIEvent('Opening status update dialog', id);
    setAppointmentToUpdate({ id, status });
    setIsStatusDialogOpen(true);
  }, [validateAppointmentExists, toast]);

  const closeStatusUpdateDialog = useCallback(() => {
    logUIEvent('Closing status update dialog');
    setIsStatusDialogOpen(false);
    // Use setTimeout to avoid state conflicts
    setTimeout(() => {
      setAppointmentToUpdate(null);
    }, 100);
  }, []);

  const openCancelDialog = useCallback((id: string) => {
    if (!validateAppointmentExists(id)) {
      logAppointmentError('Tentativa de abrir diálogo de cancelamento com ID inválido', id || 'null');
      toast({
        title: 'Erro na operação',
        description: 'ID de agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    logUIEvent('Opening cancel dialog', id);
    setAppointmentToCancel(id);
    setCancelReason('');
    setIsCancelDialogOpen(true);
  }, [validateAppointmentExists, toast]);

  const closeCancelDialog = useCallback(() => {
    logUIEvent('Closing cancel dialog');
    setIsCancelDialogOpen(false);
    setCancelReason('');
    // Use setTimeout to avoid state conflicts
    setTimeout(() => {
      setAppointmentToCancel(null);
    }, 100);
  }, []);

  const openRescheduleDialog = useCallback((appointment: AppointmentWithDetails) => {
    if (!appointment || !validateAppointmentExists(appointment.id)) {
      logAppointmentError('Tentativa de reagendar com agendamento inválido', appointment?.id || 'null');
      toast({
        title: 'Erro na operação',
        description: 'Agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    logUIEvent('Opening reschedule dialog', appointment.id);
    setSelectedAppointment(appointment);
    setIsRescheduleDialogOpen(true);
  }, [validateAppointmentExists, toast]);

  const closeRescheduleDialog = useCallback(() => {
    logUIEvent('Closing reschedule dialog');
    setIsRescheduleDialogOpen(false);
  }, []);

  return {
    // State
    selectedAppointment,
    appointmentToUpdate,
    appointmentToCancel,
    cancelReason,
    isStatusDialogOpen,
    isCancelDialogOpen,
    isRescheduleDialogOpen,
    
    // Actions
    setSelectedAppointment,
    setCancelReason,
    openAppointmentDetails,
    closeAppointmentDetails,
    openStatusUpdateDialog,
    closeStatusUpdateDialog,
    openCancelDialog,
    closeCancelDialog,
    openRescheduleDialog,
    closeRescheduleDialog,
    validateAppointmentExists
  };
}
