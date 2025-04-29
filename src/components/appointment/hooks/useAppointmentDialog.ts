
import { useState } from 'react';
import { useRescheduleAppointment } from '@/hooks/useRescheduleAppointment';
import { useUpdateAppointmentStatus } from '@/hooks/useUpdateAppointmentStatus';
import { useToast } from '@/hooks/use-toast';
import { createWhatsAppLink } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentStatus, AppointmentWithDetails } from '@/types/appointment.types';
import { logAppointmentAction, logAppointmentError } from '@/utils/debugUtils';

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

  // Make sure we always have a valid appointment object
  if (!appointment || !appointment.id) {
    logAppointmentError("Agendamento inválido em useAppointmentDialog", "unknown");
    throw new Error("Agendamento inválido");
  }

  /**
   * Handles rescheduling an appointment
   */
  const handleReschedule = async (date: Date, time: string) => {
    logAppointmentAction("Iniciando reagendamento via diálogo", appointment.id, { date, time });
    
    try {
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
        
        if (onAppointmentUpdated) {
          onAppointmentUpdated();
        }
        
        onClose();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      logAppointmentError("Erro ao reagendar via diálogo", appointment.id, error);
      return false;
    }
  };

  /**
   * Handles updating an appointment status
   */
  const handleStatusUpdate = async (status: AppointmentStatus) => {
    logAppointmentAction("Iniciando atualização de status via diálogo", appointment.id, { status });
    
    try {
      const success = await updateStatus(appointment.id, status);
      
      if (success) {
        toast({
          title: status === 'concluido' ? "Agendamento concluído" : "Agendamento cancelado",
          description: status === 'concluido' 
            ? "O agendamento foi marcado como concluído."
            : "O agendamento foi cancelado com sucesso.",
        });
        
        if (onAppointmentUpdated) {
          onAppointmentUpdated();
        }
        
        onClose();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      logAppointmentError("Erro ao atualizar status via diálogo", appointment.id, error);
      return false;
    }
  };

  /**
   * Handles deleting an appointment
   */
  const handleDelete = async () => {
    logAppointmentAction("Iniciando exclusão via diálogo", appointment.id);
    
    try {
      const success = await deleteAppointment(appointment.id);
      
      if (success) {
        toast({
          title: "Agendamento excluído",
          description: "O agendamento foi excluído permanentemente.",
        });
        
        if (onAppointmentUpdated) {
          onAppointmentUpdated();
        }
        
        onClose();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      logAppointmentError("Erro ao excluir via diálogo", appointment.id, error);
      return false;
    }
  };

  /**
   * Handles sending a WhatsApp message to the client
   */
  const handleSendWhatsApp = () => {
    try {
      const message = `Olá ${appointment.cliente.nome.split(' ')[0]}! Confirmamos seu agendamento para ${appointment.servico.nome} no dia ${format(parseISO(appointment.data), "dd/MM", { locale: ptBR })} às ${appointment.hora}.`;
      
      logAppointmentAction("Enviando WhatsApp", appointment.id, { 
        cliente: appointment.cliente.nome,
        telefone: appointment.cliente.telefone
      });
      
      window.open(createWhatsAppLink(appointment.cliente.telefone, message), "_blank");
      return true;
    } catch (error) {
      logAppointmentError("Erro ao enviar WhatsApp", appointment.id, error);
      return false;
    }
  };

  return {
    handleReschedule,
    handleStatusUpdate,
    handleDelete,
    handleSendWhatsApp,
    isRescheduling,
    isUpdatingStatus,
    isDeleting,
    isLoading: isRescheduling || isUpdatingStatus || isDeleting
  };
}
