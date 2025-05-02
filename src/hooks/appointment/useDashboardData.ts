import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Hook for fetching dashboard data with improved error handling and data loading
 */
export const useDashboardData = () => {
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const lastDayOfMonth = endOfMonth(today);
  
  const firstDayFormatted = format(firstDayOfMonth, 'yyyy-MM-dd');
  const lastDayFormatted = format(lastDayOfMonth, 'yyyy-MM-dd');
  const currentMonthName = format(today, 'MMMM yyyy', { locale: ptBR });
  
  const fetchAppointmentMetrics = async () => {
    console.log('📊 Fetching appointment metrics for dashboard...');
    try {
      // Get appointments for the current month
      const { data: appointments, error } = await supabase
        .from('agendamentos')
        .select(`
          id, 
          data, 
          hora, 
          status, 
          servico:servicos(valor)
        `)
        .gte('data', firstDayFormatted)
        .lte('data', lastDayFormatted);

      if (error) throw error;

      // Calculate metrics
      const totalAppointments = appointments?.length || 0;
      const scheduledAppointments = appointments?.filter(a => a.status === 'agendado')?.length || 0;
      const completedAppointments = appointments?.filter(a => a.status === 'concluido')?.length || 0;
      const canceledAppointments = appointments?.filter(a => a.status === 'cancelado')?.length || 0;
      
      // Calculate total revenue from completed appointments - fix the type issue
      const totalRevenue = appointments
        ?.filter(a => a.status === 'concluido')
        ?.reduce((sum, a) => {
          // Handle the case where servico might be null or not have the expected structure
          const servicoValor = a.servico && typeof a.servico === 'object' ? (a.servico as any).valor || 0 : 0;
          return sum + servicoValor;
        }, 0) || 0;
      
      console.log(`✅ Dashboard metrics calculated: ${totalAppointments} appointments, ${scheduledAppointments} scheduled, ${completedAppointments} completed, ${canceledAppointments} canceled`);
      
      return {
        totalAppointments,
        scheduledAppointments,
        completedAppointments,
        canceledAppointments,
        totalRevenue
      };
    } catch (error) {
      console.error('❌ Error fetching appointment metrics:', error);
      throw error;
    }
  };
  
  const fetchRecentAppointments = async () => {
    console.log('📊 Fetching recent appointments for dashboard...');
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data,
          hora,
          status,
          cliente:clientes(nome, telefone),
          servico:servicos(nome, valor),
          profissional:profissionais(nome)
        `)
        .eq('status', 'agendado')
        .order('data', { ascending: true })
        .order('hora', { ascending: true })
        .limit(5);

      if (error) throw error;
      
      console.log(`✅ Retrieved ${data?.length || 0} recent appointments`);
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching recent appointments:', error);
      throw error;
    }
  };
  
  const fetchNewClientsCount = async () => {
    console.log('📊 Fetching new clients count for dashboard...');
    try {
      const { count, error } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayFormatted);

      if (error) throw error;
      
      console.log(`✅ Found ${count || 0} new clients this month`);
      return count || 0;
    } catch (error) {
      console.error('❌ Error fetching new clients count:', error);
      throw error;
    }
  };
  
  const fetchAppointmentTrend = async () => {
    const lastMonth = subMonths(today, 1);
    const lastMonthStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    const lastMonthEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
    
    console.log('📊 Calculating appointment trends...');
    try {
      // Get current month appointments
      const { data: currentMonthData, error: currentMonthError } = await supabase
        .from('agendamentos')
        .select('id')
        .gte('data', firstDayFormatted)
        .lte('data', lastDayFormatted);

      if (currentMonthError) throw currentMonthError;

      // Get previous month appointments
      const { data: lastMonthData, error: lastMonthError } = await supabase
        .from('agendamentos')
        .select('id')
        .gte('data', lastMonthStart)
        .lte('data', lastMonthEnd);

      if (lastMonthError) throw lastMonthError;

      const currentMonthCount = currentMonthData?.length || 0;
      const lastMonthCount = lastMonthData?.length || 0;
      
      // Calculate percentage change
      let trend = 0;
      if (lastMonthCount > 0) {
        trend = Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100);
      } else if (currentMonthCount > 0) {
        trend = 100; // If last month was 0 and this month has appointments, it's a 100% increase
      }
      
      console.log(`✅ Appointment trend: ${trend}% (from ${lastMonthCount} to ${currentMonthCount})`);
      return trend;
    } catch (error) {
      console.error('❌ Error calculating appointment trend:', error);
      return 0;
    }
  };
  
  const fetchRevenueTrend = async () => {
    const lastMonth = subMonths(today, 1);
    const lastMonthStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    const lastMonthEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
    
    console.log('📊 Calculating revenue trends...');
    try {
      // Get completed appointments for current month with revenue
      const { data: currentMonthData, error: currentMonthError } = await supabase
        .from('agendamentos')
        .select('servico:servicos(valor)')
        .eq('status', 'concluido')
        .gte('data', firstDayFormatted)
        .lte('data', lastDayFormatted);

      if (currentMonthError) throw currentMonthError;

      // Get completed appointments for last month with revenue
      const { data: lastMonthData, error: lastMonthError } = await supabase
        .from('agendamentos')
        .select('servico:servicos(valor)')
        .eq('status', 'concluido')
        .gte('data', lastMonthStart)
        .lte('data', lastMonthEnd);

      if (lastMonthError) throw lastMonthError;

      // Fix the type issues with proper typecasting
      const currentMonthRevenue = currentMonthData?.reduce((sum, item) => {
        const servicoValor = item.servico && typeof item.servico === 'object' ? (item.servico as any).valor || 0 : 0;
        return sum + servicoValor;
      }, 0) || 0;
      
      const lastMonthRevenue = lastMonthData?.reduce((sum, item) => {
        const servicoValor = item.servico && typeof item.servico === 'object' ? (item.servico as any).valor || 0 : 0;
        return sum + servicoValor;
      }, 0) || 0;
      
      // Calculate percentage change
      let trend = 0;
      if (lastMonthRevenue > 0) {
        trend = Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
      } else if (currentMonthRevenue > 0) {
        trend = 100; // If last month was 0 and this month has revenue, it's a 100% increase
      }
      
      console.log(`✅ Revenue trend: ${trend}% (from ${lastMonthRevenue} to ${currentMonthRevenue})`);
      return trend;
    } catch (error) {
      console.error('❌ Error calculating revenue trend:', error);
      return 0;
    }
  };
  
  const fetchClientsTrend = async () => {
    const lastMonth = subMonths(today, 1);
    const lastMonthStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    const lastMonthEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
    
    console.log('📊 Calculating clients trends...');
    try {
      // Get new clients for current month
      const { count: currentMonthCount, error: currentMonthError } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayFormatted)
        .lte('created_at', lastDayFormatted);

      if (currentMonthError) throw currentMonthError;

      // Get new clients for last month
      const { count: lastMonthCount, error: lastMonthError } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart)
        .lte('created_at', lastMonthEnd);

      if (lastMonthError) throw lastMonthError;

      const currentCount = currentMonthCount || 0;
      const lastCount = lastMonthCount || 0;
      
      // Calculate percentage change
      let trend = 0;
      if (lastCount > 0) {
        trend = Math.round(((currentCount - lastCount) / lastCount) * 100);
      } else if (currentCount > 0) {
        trend = 100; // If last month was 0 and this month has new clients, it's a 100% increase
      }
      
      console.log(`✅ Clients trend: ${trend}% (from ${lastCount} to ${currentCount})`);
      return trend;
    } catch (error) {
      console.error('❌ Error calculating clients trend:', error);
      return 0;
    }
  };

  // All dashboard data in a single query
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard-data', firstDayFormatted, lastDayFormatted],
    queryFn: async () => {
      console.log('📊 Fetching all dashboard data...');
      try {
        // Execute all queries in parallel
        const [
          metrics,
          recentAppointments,
          newClientsCount,
          appointmentsTrend,
          revenueTrend,
          clientsTrend
        ] = await Promise.all([
          fetchAppointmentMetrics(),
          fetchRecentAppointments(),
          fetchNewClientsCount(),
          fetchAppointmentTrend(),
          fetchRevenueTrend(),
          fetchClientsTrend()
        ]);
        
        console.log('✅ All dashboard data fetched successfully');
        
        return {
          ...metrics,
          recentAppointments,
          newClientsCount,
          appointmentsTrend,
          revenueTrend,
          clientsTrend,
          currentMonthName
        };
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });

  return {
    ...dashboardData,
    isLoading,
    error
  };
};
