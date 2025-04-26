
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Service, Professional, AppointmentWithDetails } from '@/lib/supabase';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ServiceStats = {
  id: string;
  name: string;
  count: number;
  value: number;
};

type ProfessionalStats = {
  id: string;
  name: string;
  count: number;
};

type StatusCount = {
  status: string;
  count: number;
  percentage: number;
};

type DashboardData = {
  totalAppointments: number;
  totalRevenue: number;
  statusCounts: StatusCount[];
  topServices: ServiceStats[];
  topProfessionals: ProfessionalStats[];
  recentAppointments: AppointmentWithDetails[];
  isLoading: boolean;
  error: Error | null;
  currentMonthName: string;
};

export const useDashboardData = (): DashboardData => {
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);
  const currentMonthName = format(now, 'MMMM yyyy', { locale: ptBR });
  
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');
  
  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['dashboard-appointments', formattedStartDate, formattedEndDate],
    queryFn: async () => {
      // Fetch all appointments for the current month with related data
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*),
          profissional:profissionais(*)
        `)
        .gte('data', formattedStartDate)
        .lte('data', formattedEndDate);

      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  // Calculate dashboard metrics
  const calculateDashboardMetrics = () => {
    if (!appointments) return {
      totalAppointments: 0,
      totalRevenue: 0,
      statusCounts: [],
      topServices: [],
      topProfessionals: [],
      recentAppointments: []
    };

    // Total appointments
    const totalAppointments = appointments.length;
    
    // Calculate status counts
    const statusMap: Record<string, number> = appointments.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array with percentages
    const statusCounts: StatusCount[] = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
      percentage: totalAppointments > 0 ? (count / totalAppointments) * 100 : 0
    }));
    
    // Calculate revenue (only from completed and scheduled appointments)
    const totalRevenue = appointments
      .filter(app => app.status === 'concluido' || app.status === 'agendado')
      .reduce((sum, app) => sum + (app.servico?.valor || 0), 0);
    
    // Count services
    const serviceMap = new Map<string, { count: number; value: number; name: string }>();
    appointments.forEach(app => {
      if (app.servico) {
        const existing = serviceMap.get(app.servico.id) || { 
          count: 0, 
          value: 0, 
          name: app.servico.nome 
        };
        
        serviceMap.set(app.servico.id, {
          count: existing.count + 1,
          value: existing.value + app.servico.valor,
          name: app.servico.nome
        });
      }
    });
    
    // Convert to array and sort
    const topServices = Array.from(serviceMap.entries())
      .map(([id, { count, value, name }]) => ({ id, count, value, name }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Count professionals
    const professionalMap = new Map<string, { count: number; name: string }>();
    appointments.forEach(app => {
      if (app.profissional) {
        const existing = professionalMap.get(app.profissional.id) || { 
          count: 0, 
          name: app.profissional.nome 
        };
        
        professionalMap.set(app.profissional.id, {
          count: existing.count + 1,
          name: app.profissional.nome
        });
      }
    });
    
    // Convert to array and sort
    const topProfessionals = Array.from(professionalMap.entries())
      .map(([id, { count, name }]) => ({ id, count, name }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Get recent appointments (last 5)
    const recentAppointments = [...appointments]
      .sort((a, b) => {
        const dateA = new Date(`${a.data}T${a.hora}`).getTime();
        const dateB = new Date(`${b.data}T${b.hora}`).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
    
    return {
      totalAppointments,
      totalRevenue,
      statusCounts,
      topServices,
      topProfessionals,
      recentAppointments
    };
  };
  
  const metrics = calculateDashboardMetrics();
  
  return {
    ...metrics,
    isLoading,
    error: error as Error | null,
    currentMonthName
  };
};
