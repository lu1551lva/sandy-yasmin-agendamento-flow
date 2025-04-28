
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';
import { useUpdateAppointmentStatus } from './useUpdateAppointmentStatus';

export const useAppointmentStatusUpdate = () => {
  const { updateStatus, isLoading } = useUpdateAppointmentStatus();

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    return await updateStatus(appointmentId, newStatus);
  };

  return {
    updateStatus: updateAppointmentStatus,
    isLoading,
  };
};
