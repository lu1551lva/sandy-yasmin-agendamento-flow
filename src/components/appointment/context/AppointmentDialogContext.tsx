
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AppointmentWithDetails, AppointmentStatus } from '@/types/appointment.types';
import { useUpdateAppointmentStatus } from '@/hooks/useUpdateAppointmentStatus';
import { useRescheduleAppointment } from '@/hooks/useRescheduleAppointment';
import { useToast } from '@/hooks/use-toast';
import { logAppointmentAction, logAppointmentError, validateAppointmentId, logUIEvent } from '@/utils/debugUtils';

interface AppointmentDialogContextType {
  // State
  selectedAppointment: AppointmentWithDetails | null;
  appointmentToUpdate: { id: string; status: AppointmentStatus } | null;
  appointmentToCancel: string | null;
  cancelReason: string;
  isStatusDialogOpen: boolean;
  isCancelDialogOpen: boolean;
  isRescheduleDialogOpen: boolean;
  isLoading: boolean;
  isReschedulingLoading: boolean;
  
  // Actions
  openAppointmentDetails: (appointment: AppointmentWithDetails) => void;
  closeAppointmentDetails: () => void;
  openStatusUpdateDialog: (id: string, status: AppointmentStatus) => void;
  closeStatusUpdateDialog: () => void;
  openCancelDialog: (id: string) => void;
  closeCancelDialog: () => void;
  openRescheduleDialog: (appointment: AppointmentWithDetails) => void;
  closeRescheduleDialog: () => void;
  handleStatusUpdate: () => Promise<boolean>;
  handleCancel: () => Promise<boolean>;
  handleReschedule: (date: Date, time: string) => Promise<boolean>;
  validateAppointmentExists: (id: string | null) => boolean;
  
  // Helpers
  setSelectedAppointment: (appointment: AppointmentWithDetails | null) => void;
  setCancelReason: (reason: string) => void;
}

const AppointmentDialogContext = createContext<AppointmentDialogContextType | undefined>(undefined);

export const useAppointmentDialog = () => {
  const context = useContext(AppointmentDialogContext);
  if (context === undefined) {
    throw new Error('useAppointmentDialog must be used within an AppointmentDialogProvider');
  }
  return context;
};

interface AppointmentDialogProviderProps {
  children: ReactNode;
  onAppointmentUpdated: () => void;
}

export function AppointmentDialogProvider({ 
  children, 
  onAppointmentUpdated 
}: AppointmentDialogProviderProps) {
  // State
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{ id: string; status: AppointmentStatus } | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  
  // Hooks
  const { toast } = useToast();
  const { updateStatus, isLoading } = useUpdateAppointmentStatus();
  const { rescheduleAppointment, isLoading: isReschedulingLoading } = useRescheduleAppointment();

  // Helper function to validate appointment ID
  const validateAppointmentExists = useCallback((id: string | null): boolean => {
    if (!id) {
      logAppointmentError('ID de agendamento nulo ou indefinido', 'null');
      return false;
    }
    return validateAppointmentId(id);
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

  // Action handlers
  const handleStatusUpdate = useCallback(async (): Promise<boolean> => {
    if (!appointmentToUpdate || !validateAppointmentExists(appointmentToUpdate.id)) {
      logAppointmentError('Tentativa de atualizar status sem ID válido', appointmentToUpdate?.id || 'null');
      toast({
        title: 'Erro na operação',
        description: 'ID de agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    logAppointmentAction('Atualizando status', appointmentToUpdate.id, {
      status: appointmentToUpdate.status
    });

    try {
      const success = await updateStatus(appointmentToUpdate.id, appointmentToUpdate.status);
      
      if (success) {
        toast({
          title: appointmentToUpdate.status === 'concluido' ? 'Agendamento concluído' : 'Status atualizado',
          description: appointmentToUpdate.status === 'concluido'
            ? 'O agendamento foi marcado como concluído com sucesso.'
            : 'O status do agendamento foi atualizado com sucesso.',
        });
        
        closeStatusUpdateDialog();
        onAppointmentUpdated();
        return true;
      } else {
        toast({
          title: 'Erro na operação',
          description: 'Não foi possível atualizar o status. Tente novamente.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      logAppointmentError('Erro ao atualizar status', appointmentToUpdate.id, error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante a atualização. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  }, [appointmentToUpdate, validateAppointmentExists, updateStatus, toast, closeStatusUpdateDialog, onAppointmentUpdated]);

  const handleCancel = useCallback(async (): Promise<boolean> => {
    if (!appointmentToCancel || !validateAppointmentExists(appointmentToCancel)) {
      logAppointmentError('Tentativa de cancelar sem ID válido', appointmentToCancel || 'null');
      toast({
        title: 'Erro na operação',
        description: 'ID de agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    const reasonToUse = cancelReason || 'Cancelamento sem motivo especificado';
    logAppointmentAction('Cancelando agendamento', appointmentToCancel, {
      motivo: reasonToUse
    });

    try {
      const success = await updateStatus(appointmentToCancel, 'cancelado', reasonToUse);
      
      if (success) {
        toast({
          title: 'Agendamento cancelado',
          description: 'O agendamento foi cancelado com sucesso.',
        });
        
        closeCancelDialog();
        onAppointmentUpdated();
        return true;
      } else {
        toast({
          title: 'Erro na operação',
          description: 'Não foi possível cancelar o agendamento. Tente novamente.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      logAppointmentError('Erro ao cancelar agendamento', appointmentToCancel, error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante o cancelamento. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  }, [appointmentToCancel, cancelReason, validateAppointmentExists, updateStatus, toast, closeCancelDialog, onAppointmentUpdated]);

  const handleReschedule = useCallback(async (date: Date, time: string): Promise<boolean> => {
    if (!selectedAppointment || !validateAppointmentExists(selectedAppointment.id)) {
      logAppointmentError('Tentativa de reagendar sem agendamento válido', selectedAppointment?.id || 'null');
      toast({
        title: 'Erro na operação',
        description: 'Agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    logAppointmentAction('Reagendando', selectedAppointment.id, { date, time });

    try {
      const success = await rescheduleAppointment(
        selectedAppointment.id,
        date,
        time,
        selectedAppointment.profissional.id
      );
      
      if (success) {
        toast({
          title: 'Agendamento reagendado',
          description: 'O agendamento foi reagendado com sucesso.',
        });
        
        closeRescheduleDialog();
        onAppointmentUpdated();
        return true;
      } else {
        toast({
          title: 'Erro na operação',
          description: 'Não foi possível reagendar o agendamento. Tente novamente.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      logAppointmentError('Erro ao reagendar agendamento', selectedAppointment.id, error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante o reagendamento. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  }, [selectedAppointment, validateAppointmentExists, rescheduleAppointment, toast, closeRescheduleDialog, onAppointmentUpdated]);

  const value = {
    // State
    selectedAppointment,
    appointmentToUpdate,
    appointmentToCancel,
    cancelReason,
    isStatusDialogOpen,
    isCancelDialogOpen,
    isRescheduleDialogOpen,
    isLoading,
    isReschedulingLoading,
    
    // Actions
    openAppointmentDetails,
    closeAppointmentDetails,
    openStatusUpdateDialog,
    closeStatusUpdateDialog,
    openCancelDialog,
    closeCancelDialog,
    openRescheduleDialog,
    closeRescheduleDialog,
    handleStatusUpdate,
    handleCancel,
    handleReschedule,
    validateAppointmentExists,
    
    // Helpers
    setSelectedAppointment,
    setCancelReason
  };

  return (
    <AppointmentDialogContext.Provider value={value}>
      {children}
    </AppointmentDialogContext.Provider>
  );
}
