import { useState } from "react";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { Calendar as CalendarIcon, DollarSign, Users, Check, X, TrendingUp, RefreshCw, Clock, Percent } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatCurrency } from "@/lib/currencyUtils";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { RecentReviews } from "@/components/admin/dashboard/RecentReviews";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { AppointmentStatusChart } from "@/components/admin/dashboard/AppointmentStatusChart";
import { WeeklyOccupancyChart } from "@/components/admin/dashboard/WeeklyOccupancyChart";

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const limit = 5;

  // Fetch dashboard data from both hooks
  const { 
    // Appointment metrics
    totalAppointments,
    scheduledAppointments,
    completedAppointments,
    canceledAppointments,
    
    // Financial metrics
    totalRevenue,
    
    // Client metrics
    newClientsCount,
    
    // Other data
    recentAppointments = [],
    currentMonthName,
    
    // Trends
    appointmentsTrend,
    revenueTrend,
    clientsTrend,
    
    // Status
    isLoading: isLoadingDashboard,
    error
  } = useDashboardData();
  
  // Get additional stats from our enhanced hook
  const { stats, isLoading: isLoadingStats } = useDashboardStats();
  
  const isLoading = isLoadingDashboard || isLoadingStats;

  // Function to handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log("🔄 Manual dashboard refresh requested");
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      await queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['new-clients'] });
      
      // Force refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['dashboard-data'] }),
        queryClient.refetchQueries({ queryKey: ['upcoming-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['new-clients'] })
      ]);
      
      console.log("✅ Dashboard data refreshed successfully");
    } catch (error) {
      console.error("❌ Error refreshing dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Prepare chart data
  const statusChartData = [
    { name: "Agendados", value: stats.statusDistribution.agendado, color: "#3b82f6" },
    { name: "Concluídos", value: stats.statusDistribution.concluido, color: "#22c55e" },
    { name: "Cancelados", value: stats.statusDistribution.cancelado, color: "#ef4444" },
  ];
  
  // Sample weekly occupancy data (in a real app, this would come from the API)
  const weeklyOccupancyData = [
    { name: "Segunda", ocupados: 12, disponiveis: 8 },
    { name: "Terça", ocupados: 15, disponiveis: 5 },
    { name: "Quarta", ocupados: 18, disponiveis: 2 },
    { name: "Quinta", ocupados: 10, disponiveis: 10 },
    { name: "Sexta", ocupados: 20, disponiveis: 0 },
    { name: "Sábado", ocupados: 16, disponiveis: 4 },
    { name: "Domingo", ocupados: 5, disponiveis: 15 },
  ];

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Agendado</Badge>;
      case "concluido":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
      case "cancelado":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Agendamentos do Mês" 
          value={stats.appointmentsThisMonth}
          description={`Esta semana: ${stats.appointmentsThisWeek}`}
          trend={stats.appointmentsTrend}
          icon={<CalendarIcon className="h-6 w-6" />}
          loading={isLoading || isRefreshing}
        />
        <StatsCard 
          title="Faturamento" 
          value={stats.revenueThisMonth} 
          valuePrefix="R$ " 
          description={`Esta semana: R$ ${stats.revenueThisWeek.toFixed(2)}`}
          trend={stats.revenueTrend}
          icon={<DollarSign className="h-6 w-6" />}
          loading={isLoading || isRefreshing}
        />
        <StatsCard 
          title="Taxa de Ocupação" 
          value={stats.occupationRate} 
          valuePrefix="" 
          valueFormatFn={(value) => `${value}%`}
          description={`${stats.statusDistribution.agendado + stats.statusDistribution.concluido} slots ocupados`}
          trend={5}
          trendColor="green"
          icon={<Clock className="h-6 w-6" />}
          loading={isLoading || isRefreshing}
        />
        <StatsCard 
          title="Taxa de Cancelamento" 
          value={stats.cancelationRate} 
          valuePrefix="" 
          valueFormatFn={(value) => `${value}%`}
          description={`${stats.statusDistribution.cancelado} agendamentos cancelados`}
          trend={-2}
          trendColor="red"
          icon={<Percent className="h-6 w-6" />}
          loading={isLoading || isRefreshing}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentStatusChart data={statusChartData} loading={isLoading || isRefreshing} />
        <WeeklyOccupancyChart data={weeklyOccupancyData} loading={isLoading || isRefreshing} />
        
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Agendamentos</CardTitle>
              <CardDescription>Agendamentos programados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || isRefreshing ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : recentAppointments.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex justify-between border-b pb-2 last:border-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{appointment.cliente?.nome || "Cliente sem nome"}</p>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.servico?.nome || "Serviço não especificado"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{appointment.data}</p>
                          <p className="text-sm text-muted-foreground">{appointment.hora}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-4">
                      <DataTablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Não há agendamentos próximos
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
