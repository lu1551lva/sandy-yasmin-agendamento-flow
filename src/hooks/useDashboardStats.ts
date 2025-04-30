
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  totalSalons: number;
  activeSalons: number;
  trialSalons: number;
  inactiveSalons: number;
  totalAppointments: number;
  totalProfessionals: number;
  totalServices: number;
  // Properties needed in Dashboard.tsx
  appointmentsThisMonth: number;
  appointmentsThisWeek: number;
  revenueThisMonth: number;
  revenueThisWeek: number;
  newClientsThisMonth: number;
  appointmentsTrend: number;
  revenueTrend: number;
  clientsTrend: number;
  occupationRate: number;
  cancelationRate: number;
  statusDistribution: {
    agendado: number;
    concluido: number;
    cancelado: number;
  };
}

export const useDashboardStats = () => {
  const [isLoading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSalons: 0,
    activeSalons: 0,
    trialSalons: 0,
    inactiveSalons: 0,
    totalAppointments: 0,
    totalProfessionals: 0,
    totalServices: 0,
    appointmentsThisMonth: 0,
    appointmentsThisWeek: 0,
    revenueThisMonth: 0,
    revenueThisWeek: 0,
    newClientsThisMonth: 0,
    appointmentsTrend: 5,  // Default trend values
    revenueTrend: 3,
    clientsTrend: 8,
    occupationRate: 0,
    cancelationRate: 0,
    statusDistribution: {
      agendado: 0,
      concluido: 0,
      cancelado: 0
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Get current date info
        const now = new Date();
        const currentMonth = format(now, 'yyyy-MM');
        const startOfMonth = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
        const endOfMonth = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd');
        
        // Get start and end of week 
        const day = now.getDay();
        const startOfWeek = format(new Date(now.setDate(now.getDate() - day)), 'yyyy-MM-dd');
        const endOfWeek = format(new Date(now.setDate(now.getDate() + 6)), 'yyyy-MM-dd');
        
        // Reset date
        now.setDate(new Date().getDate());
        
        // Get previous month for comparison
        const prevMonth = format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'yyyy-MM');
        const startOfPrevMonth = format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'yyyy-MM-dd');
        const endOfPrevMonth = format(new Date(now.getFullYear(), now.getMonth(), 0), 'yyyy-MM-dd');

        // Fetch salons counts
        const { data: saloes, error: saloesError } = await supabase
          .from('saloes')
          .select('*');
          
        if (saloesError) throw saloesError;
        
        const activeSalons = saloes?.filter(s => s.plano === 'ativo') || [];
        const trialSalons = saloes?.filter(s => s.plano === 'trial') || [];
        const inactiveSalons = saloes?.filter(s => s.plano === 'inativo') || [];

        // Count appointments
        const { count: appointmentsCount } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true });
          
        // Count professionals
        const { count: professionalsCount } = await supabase
          .from('profissionais')
          .select('*', { count: 'exact', head: true });
          
        // Count services
        const { count: servicesCount } = await supabase
          .from('servicos')
          .select('*', { count: 'exact', head: true });

        // Get this month's appointments
        const { count: monthlyAppointmentsCount } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .gte('data', startOfMonth)
          .lte('data', endOfMonth);
          
        // Get this week's appointments
        const { count: weeklyAppointmentsCount } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .gte('data', startOfWeek)
          .lte('data', endOfWeek);

        // Get previous month's appointments for trend
        const { count: prevMonthAppointmentsCount } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .gte('data', startOfPrevMonth)
          .lte('data', endOfPrevMonth);

        // Get this month's revenue
        const { data: monthlyRevenue } = await supabase
          .from('agendamentos')
          .select('servico:servicos(valor)')
          .gte('data', startOfMonth)
          .lte('data', endOfMonth)
          .eq('status', 'concluido');

        // Get this week's revenue
        const { data: weeklyRevenue } = await supabase
          .from('agendamentos')
          .select('servico:servicos(valor)')
          .gte('data', startOfWeek)
          .lte('data', endOfWeek)
          .eq('status', 'concluido');

        // Get previous month's revenue for trend
        const { data: prevMonthRevenue } = await supabase
          .from('agendamentos')
          .select('servico:servicos(valor)')
          .gte('data', startOfPrevMonth)
          .lte('data', endOfPrevMonth)
          .eq('status', 'concluido');

        // Calculate revenue from appointments
        const calculateRevenue = (revenueData: any[]) => {
          return revenueData?.reduce((total, item) => {
            const servicoValor = item.servico && typeof item.servico === 'object' ? (item.servico as any).valor : 0;
            return total + (servicoValor || 0);
          }, 0) || 0;
        };

        const monthRevenue = calculateRevenue(monthlyRevenue || []);
        const weekRevenue = calculateRevenue(weeklyRevenue || []);
        const prevMonthRevenueValue = calculateRevenue(prevMonthRevenue || []);

        // Get new clients this month
        const { count: newClientsCount } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth);

        // Get previous month's new clients for trend
        const { count: prevMonthNewClientsCount } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfPrevMonth)
          .lte('created_at', endOfPrevMonth);

        // Get appointment status distribution
        const { data: statusCounts } = await supabase
          .from('agendamentos')
          .select('status, count', { count: 'exact' })
          .gte('data', startOfMonth)
          .lte('data', endOfMonth)
          .group('status');

        const statusDistribution = {
          agendado: 0,
          concluido: 0,
          cancelado: 0
        };

        statusCounts?.forEach((item: any) => {
          if (statusDistribution[item.status as keyof typeof statusDistribution] !== undefined) {
            statusDistribution[item.status as keyof typeof statusDistribution] = item.count;
          }
        });

        // Calculate trends
        const calculateTrend = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return Math.round(((current - previous) / previous) * 100);
        };

        const appointmentsTrend = calculateTrend(monthlyAppointmentsCount || 0, prevMonthAppointmentsCount || 0);
        const revenueTrend = calculateTrend(monthRevenue, prevMonthRevenueValue);
        const clientsTrend = calculateTrend(newClientsCount || 0, prevMonthNewClientsCount || 0);

        // Calculate occupation rate
        const totalAppointments = (statusDistribution.agendado + statusDistribution.concluido + statusDistribution.cancelado) || 1;
        const occupationRate = Math.round(((statusDistribution.agendado + statusDistribution.concluido) / totalAppointments) * 100);
        
        // Calculate cancellation rate
        const cancelationRate = Math.round((statusDistribution.cancelado / totalAppointments) * 100);

        setStats({
          totalSalons: saloes?.length || 0,
          activeSalons: activeSalons.length,
          trialSalons: trialSalons.length,
          inactiveSalons: inactiveSalons.length,
          totalAppointments: appointmentsCount || 0,
          totalProfessionals: professionalsCount || 0,
          totalServices: servicesCount || 0,
          appointmentsThisMonth: monthlyAppointmentsCount || 0,
          appointmentsThisWeek: weeklyAppointmentsCount || 0,
          revenueThisMonth: monthRevenue || 0,
          revenueThisWeek: weekRevenue || 0,
          newClientsThisMonth: newClientsCount || 0,
          appointmentsTrend,
          revenueTrend,
          clientsTrend,
          occupationRate,
          cancelationRate,
          statusDistribution
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Return isLoading instead of loading to match the expected property name
  return { stats, isLoading };
};
