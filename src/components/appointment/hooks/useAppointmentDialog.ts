
import { useState } from 'react';
import { useRescheduleAppointment } from '@/hooks/useRescheduleAppointment';
import { useUpdateAppointmentStatus } from '@/hooks/useUpdateAppointmentStatus';
import { useToast } from '@/hooks/use-toast';
import { createWhatsAppLink } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentStatus, AppointmentWithDetails } from '@/types/appointment.types';

interface UseAppointmentDialogProps {
  appointment: AppointmentWithDetails;
  onAppointmentUpdated?: () => void;
  onClose: () => void;
  setShowReschedule: (value: boolean) => void;
}

export function useAppointmentDialog({ 
  appointment, 
  onAppointmentUpdated, 
  onClose,
  setShowReschedule
}: UseAppointmentDialogProps) {
  const { rescheduleAppointment, isLoading: isRescheduling } = useRescheduleAppointment();
  const { 
    updateStatus, 
    isLoading: isUpdatingStatus, 
    deleteAppointment, 
    isLoading: isDeleting 
  } = useUpdateAppointmentStatus();
  const { toast } = useToast();

  const handleReschedule = async (date: Date, time: string) => {
    const success = await rescheduleAppointment(
      appointment.id,
      date,
      time,
      appointment.profissional.id
    );

    if (success) {
      setShowReschedule(false);
      toast({
        title: "Agendamento reagendado",
        description: "O agendamento foi reagendado com sucesso.",
      });
      if (onAppointmentUpdated) onAppointmentUpdated();
      onClose();
    }
  };

  const handleStatusUpdate = async (status: AppointmentStatus) => {
    const success = await updateStatus(appointment.id, status);
    
    if (success) {
      toast({
        title: status === 'concluido' ? "Agendamento concluído" : "Agendamento cancelado",
        description: status === 'concluido' 
          ? "O agendamento foi marcado como concluído."
          : "O agendamento foi cancelado com sucesso.",
      });
      
      if (onAppointmentUpdated) onAppointmentUpdated();
      onClose();
    }
  };

  const handleDelete = async () => {
    const success = await deleteAppointment(appointment.id);
    
    if (success) {
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído permanentemente.",
      });
      
      if (onAppointmentUpdated) onAppointmentUpdated();
      onClose();
    }
  };

  const handleSendWhatsApp = () => {
    const message = `Olá ${appointment.cliente.nome.split(' ')[0]}! Confirmamos seu agendamento para ${appointment.servico.nome} no dia ${format(parseISO(appointment.data), "dd/MM", { locale: ptBR })} às ${appointment.hora}.`;
    window.open(createWhatsAppLink(appointment.cliente.telefone, message), "_blank");
  };

  return {
    handleReschedule,
    handleStatusUpdate,
    handleDelete,
    handleSendWhatsApp,
    isRescheduling,
    isUpdatingStatus,
    isDeleting
  };
}
