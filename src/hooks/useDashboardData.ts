
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AppointmentWithDetails } from '@/types/appointment.types';
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
  scheduledAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  statusCounts: StatusCount[];
  topServices: ServiceStats[];
  topProfessionals: ProfessionalStats[];
  recentAppointments: AppointmentWithDetails[];
  newClientsCount: number;
  isLoading: boolean;
  error: Error | null;
  currentMonthName: string;
  appointmentsTrend: number;
  revenueTrend: number;
  clientsTrend: number;
};

export const useDashboardData = (): DashboardData => {
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);
  const currentMonthName = format(now, 'MMMM yyyy', { locale: ptBR });
  
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');
  
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['dashboard-appointments', formattedStartDate, formattedEndDate],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching dashboard data for date range:", formattedStartDate, "to", formattedEndDate);
        
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
        console.log(`✅ Retrieved ${data?.length || 0} appointments for dashboard`);
        return data || [];
      } catch (err) {
        console.error("❌ Failed to fetch dashboard appointments:", err);
        throw err;
      }
    },
    staleTime: 0, // Always get fresh data
    refetchOnWindowFocus: true,
  });

  // Fetch new clients count for the current month
  const { data: newClients = 0 } = useQuery({
    queryKey: ['new-clients', formattedStartDate, formattedEndDate],
    queryFn: async () => {
      try {
        // Get clients created this month
        const { count, error } = await supabase
          .from('clientes')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (error) throw error;
        console.log(`✅ Retrieved ${count || 0} new clients for dashboard`);
        return count || 0;
      } catch (err) {
        console.error("❌ Failed to fetch new clients count:", err);
        return 0;
      }
    }
  });

  // Calculate dashboard metrics
  const calculateDashboardMetrics = () => {
    if (!appointments || appointments.length === 0) {
      return {
        totalAppointments: 0,
        totalRevenue: 0,
        scheduledAppointments: 0,
        completedAppointments: 0,
        canceledAppointments: 0,
        statusCounts: [],
        topServices: [],
        topProfessionals: [],
        recentAppointments: [],
        appointmentsTrend: 5,
        revenueTrend: 3,
        clientsTrend: 8,
      };
    }

    console.log("📊 Calculating dashboard metrics from", appointments.length, "appointments");
    
    // Total appointments
    const totalAppointments = appointments.length;
    
    // Count by status
    const completedAppointments = appointments.filter(app => app.status === 'concluido').length;
    const scheduledAppointments = appointments.filter(app => app.status === 'agendado').length;
    const canceledAppointments = appointments.filter(app => app.status === 'cancelado').length;
    
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
    
    // Calculate revenue (only from completed appointments)
    const totalRevenue = appointments
      .filter(app => app.status === 'concluido')
      .reduce((sum, app) => {
        const servicoValor = app.servico && typeof app.servico === 'object' ? (app.servico.valor || 0) : 0;
        return sum + servicoValor;
      }, 0);
    
    console.log("💰 Calculated revenue:", totalRevenue, "from", completedAppointments, "completed appointments");
    
    // Count services
    const serviceMap = new Map<string, { count: number; value: number; name: string }>();
    appointments.forEach(app => {
      if (app.servico && typeof app.servico === 'object') {
        const servicoId = app.servico.id || 'unknown';
        const servicoNome = app.servico.nome || 'Unknown Service';
        const servicoValor = app.servico.valor || 0;
        
        const existing = serviceMap.get(servicoId) || { 
          count: 0, 
          value: 0, 
          name: servicoNome
        };
        
        serviceMap.set(servicoId, {
          count: existing.count + 1,
          value: existing.value + servicoValor,
          name: servicoNome
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
      if (app.profissional && typeof app.profissional === 'object') {
        const profId = app.profissional.id || 'unknown';
        const profName = app.profissional.nome || 'Unknown Professional';
        
        const existing = professionalMap.get(profId) || { 
          count: 0, 
          name: profName
        };
        
        professionalMap.set(profId, {
          count: existing.count + 1,
          name: profName
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
    
    // Mock trends (in a real app, this would compare to previous month)
    const appointmentsTrend = 5;
    const revenueTrend = 8;
    const clientsTrend = 3;
    
    return {
      totalAppointments,
      totalRevenue,
      scheduledAppointments,
      completedAppointments,
      canceledAppointments,
      statusCounts,
      topServices,
      topProfessionals,
      recentAppointments,
      appointmentsTrend,
      revenueTrend,
      clientsTrend
    };
  };
  
  const metrics = calculateDashboardMetrics();
  
  return {
    ...metrics,
    newClientsCount: newClients,
    isLoading,
    error: error as Error | null,
    currentMonthName
  };
};
