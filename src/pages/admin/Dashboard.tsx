
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Check, X } from "lucide-react";
import { format, startOfToday, endOfToday, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale"; // Import pt-BR locale properly

const Dashboard = () => {
  // Query for today's appointments
  const { data: todayAppointments, isLoading: todayLoading } = useQuery({
    queryKey: ["appointments", "today"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("agendamentos")
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*),
          profissional:profissionais(*)
        `)
        .eq("data", today)
        .order("hora");
        
      if (error) throw error;
      return data || [];
    },
  });

  // Query for monthly stats
  const { data: monthlyStats, isLoading: statsLoading } = useQuery({
    queryKey: ["appointments", "month-stats"],
    queryFn: async () => {
      const startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const endDate = format(endOfMonth(new Date()), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("agendamentos")
        .select("status")
        .gte("data", startDate)
        .lte("data", endDate);
        
      if (error) throw error;
      
      const total = data.length;
      const completed = data.filter(a => a.status === "concluido").length;
      const canceled = data.filter(a => a.status === "cancelado").length;
      const scheduled = data.filter(a => a.status === "agendado").length;
      
      return { total, completed, canceled, scheduled };
    },
  });

  // Query for client count
  const { data: clientCount, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients", "count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });
        
      if (error) throw error;
      return count || 0;
    },
  });

  const isLoading = todayLoading || statsLoading || clientsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das atividades do salão
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : todayAppointments?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : clientCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Concluídos este mês
            </CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : monthlyStats?.completed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              De {isLoading ? "-" : monthlyStats?.total || 0} agendamentos totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Cancelados este mês
            </CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : monthlyStats?.canceled || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa de {isLoading ? "-" : monthlyStats ? Math.round((monthlyStats.canceled / (monthlyStats.total || 1)) * 100) : 0}% de cancelamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : todayAppointments && todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((appointment: any) => (
                <div 
                  key={appointment.id} 
                  className={`p-4 border rounded-lg ${
                    appointment.status === "concluido" 
                      ? "bg-green-50 border-green-200" 
                      : appointment.status === "cancelado"
                      ? "bg-red-50 border-red-200"
                      : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{appointment.cliente.nome}</p>
                      <p className="text-sm text-gray-500">{appointment.cliente.telefone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.hora}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.status === "concluido" 
                          ? "Concluído" 
                          : appointment.status === "cancelado"
                          ? "Cancelado"
                          : "Agendado"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">{appointment.servico.nome}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Não há agendamentos para hoje.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
