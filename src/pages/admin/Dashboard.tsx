import { useState } from "react";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { Calendar as CalendarIcon, DollarSign, Users, Check, X, TrendingUp, RefreshCw } from "lucide-react";
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

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const limit = 5;

  // Fetch dashboard data
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
    isLoading,
    error
  } = useDashboardData();

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Agendamentos do Mês" 
          value={totalAppointments}
          description={`Agendados: ${scheduledAppointments}`}
          trend={appointmentsTrend}
          icon={<CalendarIcon className="h-6 w-6" />}
          loading={isLoading || isRefreshing}
        />
        <StatsCard 
          title="Faturamento" 
          value={totalRevenue} 
          valuePrefix="R$ " 
          description={`${completedAppointments} agendamentos concluídos`}
          trend={revenueTrend}
          icon={<DollarSign className="h-6 w-6" />}
          loading={isLoading || isRefreshing}
        />
        <StatsCard 
          title="Novos Clientes" 
          value={newClientsCount} 
          description={`${canceledAppointments} agendamentos cancelados`}
          trend={clientsTrend}
          icon={<Users className="h-6 w-6" />}
          loading={isLoading || isRefreshing}
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
                      <div className="text-2xl font-bold">{scheduledAppointments}</div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {totalAppointments > 0 ? 
                      Math.round((scheduledAppointments / totalAppointments) * 100) : 
                      0}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 bg-green-100 p-2 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Concluídos</div>
                      <div className="text-2xl font-bold">{completedAppointments}</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {totalAppointments > 0 ? 
                      Math.round((completedAppointments / totalAppointments) * 100) : 
                      0}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 bg-red-100 p-2 rounded-full">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Cancelados</div>
                      <div className="text-2xl font-bold">{canceledAppointments}</div>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {totalAppointments > 0 ? 
                      Math.round((canceledAppointments / totalAppointments) * 100) : 
                      0}%
                  </Badge>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-primary mr-2" />
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{totalAppointments}</span> agendamentos totais em {currentMonthName}
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
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>Faturamento do mês de {currentMonthName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-4xl font-bold mb-2">
                  {formatCurrency(totalRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Baseado em {completedAppointments} agendamentos concluídos
                </div>
                <div className="mt-6 py-6 border-t border-b grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Média por agendamento</div>
                    <div className="text-xl font-medium">
                      {formatCurrency(completedAppointments > 0 ? totalRevenue / completedAppointments : 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Comparado ao mês anterior</div>
                    <div className="text-xl font-medium text-green-600">
                      +{revenueTrend}%
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
