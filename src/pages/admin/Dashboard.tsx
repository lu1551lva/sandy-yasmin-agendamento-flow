
import { useState, useEffect } from "react";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { Calendar as CalendarIcon, DollarSign, Users, Check, X, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { formatCurrency } from "@/lib/currencyUtils";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { RecentReviews } from "@/components/admin/dashboard/RecentReviews";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);
  const currentMonthName = format(now, 'MMMM yyyy', { locale: ptBR });
  
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');

  // Fetch dashboard data
  const { 
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError
  } = useQuery({
    queryKey: ['dashboard-data', formattedStartDate, formattedEndDate],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching dashboard data for date range:", formattedStartDate, "to", formattedEndDate);
        
        // Fetch all appointments for the current month
        const { data: appointments, error } = await supabase
          .from('agendamentos')
          .select(`
            *,
            cliente:clientes(*),
            servico:servicos(*),
            profissional:profissionais(*)
          `)
          .gte('data', formattedStartDate)
          .lte('data', formattedEndDate);
          
        if (error) throw error;
        
        // Calculate metrics
        const allAppointments = appointments || [];
        const completedAppointments = allAppointments.filter(app => app.status === 'concluido');
        const canceledAppointments = allAppointments.filter(app => app.status === 'cancelado');
        const scheduledAppointments = allAppointments.filter(app => app.status === 'agendado');
        
        // Calculate revenue from completed appointments
        const monthlyRevenue = completedAppointments.reduce((total, app) => {
          return total + (app.servico?.valor || 0);
        }, 0);
        
        // Count unique new clients this month
        const { data: newClientsData, error: clientsError } = await supabase
          .from('clientes')
          .select('id, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
          
        if (clientsError) throw clientsError;
        
        const newClientsCount = newClientsData?.length || 0;
        
        // Calculate trends (mock values for now)
        // In a real implementation, this would compare to previous month
        const appointmentsTrend = 5;
        const revenueTrend = 8;
        const clientsTrend = 3;
        
        console.log("✅ Dashboard data calculated successfully");

        return {
          totalAppointments: allAppointments.length,
          completedAppointments: completedAppointments.length,
          canceledAppointments: canceledAppointments.length,
          scheduledAppointments: scheduledAppointments.length,
          monthlyRevenue,
          newClientsCount,
          appointmentsTrend,
          revenueTrend,
          clientsTrend,
          appointments: allAppointments
        };
      } catch (error) {
        console.error("❌ Failed to fetch dashboard data:", error);
        toast({
          title: "Erro ao carregar dados do dashboard",
          description: "Não foi possível buscar os dados. Por favor, tente novamente.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  });

  // Fetch upcoming appointments
  const { 
    data: upcomingAppointments = [], 
    isLoading: isUpcomingLoading 
  } = useQuery({
    queryKey: ['upcoming-appointments', currentPage, limit],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const startIndex = (currentPage - 1) * limit;
        
        // Fetch upcoming appointments
        const { data, error, count } = await supabase
          .from("agendamentos")
          .select(`
            *,
            cliente:clientes(*),
            servico:servicos(*),
            profissional:profissionais(*)
          `, { count: "exact" })
          .gte("data", today)
          .eq("status", "agendado")
          .order("data", { ascending: true })
          .order("hora", { ascending: true })
          .range(startIndex, startIndex + limit - 1);

        if (error) throw error;
        
        if (count !== null) {
          setTotalPages(Math.ceil(count / limit));
        }
        
        return data as AppointmentWithDetails[];
      } catch (error) {
        console.error("❌ Failed to fetch upcoming appointments:", error);
        return [];
      }
    },
  });

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

  const isLoading = isDashboardLoading || isUpcomingLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Agendamentos do Mês" 
          value={dashboardData?.totalAppointments || 0}
          description={`Agendados: ${dashboardData?.scheduledAppointments || 0}`}
          trend={dashboardData?.appointmentsTrend || 0}
          icon={<CalendarIcon className="h-6 w-6" />}
          loading={isLoading}
        />
        <StatsCard 
          title="Faturamento" 
          value={dashboardData?.monthlyRevenue || 0} 
          valuePrefix="R$ " 
          description={`${dashboardData?.completedAppointments || 0} agendamentos concluídos`}
          trend={dashboardData?.revenueTrend || 0}
          icon={<DollarSign className="h-6 w-6" />}
          loading={isLoading}
        />
        <StatsCard 
          title="Novos Clientes" 
          value={dashboardData?.newClientsCount || 0} 
          description={`${dashboardData?.canceledAppointments || 0} agendamentos cancelados`}
          trend={dashboardData?.clientsTrend || 0}
          icon={<Users className="h-6 w-6" />}
          loading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status de Agendamentos</CardTitle>
              <CardDescription>Visão geral dos agendamentos para {currentMonthName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 bg-blue-100 p-2 rounded-full">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Agendados</div>
                      <div className="text-2xl font-bold">{dashboardData?.scheduledAppointments || 0}</div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {Math.round(((dashboardData?.scheduledAppointments || 0) / (dashboardData?.totalAppointments || 1)) * 100)}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 bg-green-100 p-2 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Concluídos</div>
                      <div className="text-2xl font-bold">{dashboardData?.completedAppointments || 0}</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {Math.round(((dashboardData?.completedAppointments || 0) / (dashboardData?.totalAppointments || 1)) * 100)}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 bg-red-100 p-2 rounded-full">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Cancelados</div>
                      <div className="text-2xl font-bold">{dashboardData?.canceledAppointments || 0}</div>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {Math.round(((dashboardData?.canceledAppointments || 0) / (dashboardData?.totalAppointments || 1)) * 100)}%
                  </Badge>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-primary mr-2" />
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{dashboardData?.totalAppointments || 0}</span> agendamentos totais em {currentMonthName}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Próximos Agendamentos</CardTitle>
              <CardDescription>Agendamentos programados</CardDescription>
            </CardHeader>
            <CardContent>
              {isUpcomingLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex justify-between border-b pb-2 last:border-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{appointment.cliente.nome}</p>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.servico.nome}</p>
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
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>Faturamento do mês de {currentMonthName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-4xl font-bold mb-2">
                  {formatCurrency(dashboardData?.monthlyRevenue || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Baseado em {dashboardData?.completedAppointments || 0} agendamentos concluídos
                </div>
                <div className="mt-6 py-6 border-t border-b grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Média por agendamento</div>
                    <div className="text-xl font-medium">
                      {formatCurrency((dashboardData?.monthlyRevenue || 0) / (dashboardData?.completedAppointments || 1))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Comparado ao mês anterior</div>
                    <div className="text-xl font-medium text-green-600">
                      +{dashboardData?.revenueTrend || 0}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <RecentReviews />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
