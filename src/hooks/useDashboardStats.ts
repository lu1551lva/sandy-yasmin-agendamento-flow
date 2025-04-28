
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";

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
  revenueThisMonth: number;
  newClientsThisMonth: number;
  appointmentsTrend: number;
  revenueTrend: number;
  clientsTrend: number;
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
    revenueThisMonth: 0,
    newClientsThisMonth: 0,
    appointmentsTrend: 5,  // Default trend values
    revenueTrend: 3,
    clientsTrend: 8,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
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

        // Get this month's appointments (simplified)
        const { count: monthlyAppointmentsCount } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .gte('data', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

        // Get this month's revenue (simplified example)
        const { data: monthlyRevenue } = await supabase
          .from('agendamentos')
          .select('servico:servicos(valor)')
          .gte('data', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

        // Calculate revenue from appointments - Fix the valor access
        const revenue = monthlyRevenue?.reduce((total, item) => {
          // Fix: Access valor from the servico object, not from servico array
          const servicoValor = item.servico && typeof item.servico === 'object' ? (item.servico as any).valor : 0;
          return total + (servicoValor || 0);
        }, 0) || 0;

        // Get new clients this month (simplified)
        const { count: newClientsCount } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

        setStats({
          totalSalons: saloes?.length || 0,
          activeSalons: activeSalons.length,
          trialSalons: trialSalons.length,
          inactiveSalons: inactiveSalons.length,
          totalAppointments: appointmentsCount || 0,
          totalProfessionals: professionalsCount || 0,
          totalServices: servicesCount || 0,
          appointmentsThisMonth: monthlyAppointmentsCount || 0,
          revenueThisMonth: revenue || 0,
          newClientsThisMonth: newClientsCount || 0,
          appointmentsTrend: 5,  // Default trend values for simplicity
          revenueTrend: 3,
          clientsTrend: 8,
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
