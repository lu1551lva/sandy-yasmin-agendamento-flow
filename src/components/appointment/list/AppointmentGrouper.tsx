
import { useState, useEffect, useMemo } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";

interface UseAppointmentGrouperProps {
  appointments: AppointmentWithDetails[];
  showAll: boolean;
}

export function useAppointmentGrouper({ appointments, showAll }: UseAppointmentGrouperProps) {
  // Group appointments by status
  const groupedAppointments = useMemo(() => {
    const grouped = {
      agendado: [] as AppointmentWithDetails[],
      concluido: [] as AppointmentWithDetails[],
      cancelado: [] as AppointmentWithDetails[],
    };
    
    if (!appointments) return grouped;
    
    return appointments.reduce((acc, appointment) => {
      if (appointment.status in acc) {
        acc[appointment.status as keyof typeof acc].push(appointment);
      }
      return acc;
    }, grouped);
  }, [appointments]);
  
  // Check if there are any appointments
  const isEmpty = useMemo(() => {
    if (!appointments) return true;
    
    if (showAll) {
      return appointments.length === 0;
    } else {
      // In non-showAll mode, we only care about active appointments
      return groupedAppointments.agendado.length === 0;
    }
  }, [appointments, groupedAppointments, showAll]);
  
  return { groupedAppointments, isEmpty };
}
