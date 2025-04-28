
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { Calendar as CalendarIcon, DollarSign, Users } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { RecentReviews } from "@/components/admin/dashboard/RecentReviews";

const Dashboard = () => {
  const { stats, isLoading } = useDashboardStats();
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithDetails[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      setIsLoadingAppointments(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const startIndex = (currentPage - 1) * limit;
        
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
        
        setUpcomingAppointments(data as AppointmentWithDetails[]);
        
        if (count !== null) {
          setTotalPages(Math.ceil(count / limit));
        }
      } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchUpcomingAppointments();
  }, [currentPage]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Agendamentos do Mês" 
          value={stats.appointmentsThisMonth} 
          trend={stats.appointmentsTrend}
          icon={<CalendarIcon className="h-6 w-6" />}
          loading={isLoading}
        />
        <StatsCard 
          title="Faturamento do Mês" 
          value={stats.revenueThisMonth} 
          valuePrefix="R$" 
          trend={stats.revenueTrend}
          icon={<DollarSign className="h-6 w-6" />}
          loading={isLoading}
        />
        <StatsCard 
          title="Novos Clientes" 
          value={stats.newClientsThisMonth} 
          trend={stats.clientsTrend}
          icon={<Users className="h-6 w-6" />}
          loading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>Agendamentos programados para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div>Carregando...</div>
            ) : upcomingAppointments.length > 0 ? (
              <>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{appointment.cliente.nome}</p>
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
        
        <RecentReviews />
      </div>
    </div>
  );
};

export default Dashboard;
