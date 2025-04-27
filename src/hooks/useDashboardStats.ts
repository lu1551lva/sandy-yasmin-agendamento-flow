
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
}

export const useDashboardStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSalons: 0,
    activeSalons: 0,
    trialSalons: 0,
    inactiveSalons: 0,
    totalAppointments: 0,
    totalProfessionals: 0,
    totalServices: 0
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

        setStats({
          totalSalons: saloes?.length || 0,
          activeSalons: activeSalons.length,
          trialSalons: trialSalons.length,
          inactiveSalons: inactiveSalons.length,
          totalAppointments: appointmentsCount || 0,
          totalProfessionals: professionalsCount || 0,
          totalServices: servicesCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return { stats, loading };
};
