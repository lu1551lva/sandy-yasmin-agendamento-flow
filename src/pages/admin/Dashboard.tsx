
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Loader2, Calendar, DollarSign, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Chart as ChartComponent,
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend 
} from "recharts";

const STATUS_COLORS = {
  agendado: "#3b82f6", // blue
  concluido: "#10b981", // green
  cancelado: "#ef4444", // red
};

const Dashboard = () => {
  const { 
    totalAppointments, 
    totalRevenue, 
    statusCounts, 
    topServices, 
    topProfessionals, 
    recentAppointments,
    isLoading,
    currentMonthName
  } = useDashboardData();

  // Calculate percentages for each status
  const scheduledCount = statusCounts.find(s => s.status === 'agendado')?.count || 0;
  const scheduledPercentage = statusCounts.find(s => s.status === 'agendado')?.percentage || 0;
  
  const completedCount = statusCounts.find(s => s.status === 'concluido')?.count || 0;
  const completedPercentage = statusCounts.find(s => s.status === 'concluido')?.percentage || 0;
  
  const canceledCount = statusCounts.find(s => s.status === 'cancelado')?.count || 0;
  const canceledPercentage = statusCounts.find(s => s.status === 'cancelado')?.percentage || 0;

  // Format data for pie chart
  const pieChartData = statusCounts.map(item => ({
    name: item.status === 'agendado' ? 'Pendentes' : 
          item.status === 'concluido' ? 'Concluídos' : 'Cancelados',
    value: item.count,
    color: item.status === 'agendado' ? STATUS_COLORS.agendado :
           item.status === 'concluido' ? STATUS_COLORS.concluido :
           STATUS_COLORS.cancelado
  }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Indicadores do mês de {currentMonthName}
        </p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Agendamentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              No mês de {currentMonthName}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Estimado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Serviços agendados e concluídos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conclusão
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedPercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedCount} de {totalAppointments} agendamentos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Cancelamento
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {canceledPercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {canceledCount} de {totalAppointments} agendamentos
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Status Chart and Pending */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Status dos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} agendamentos`, 'Quantidade']} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">Sem dados para exibir</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Pending Appointments */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Agendamentos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentAppointments
                .filter(app => app.status === 'agendado')
                .map((appointment) => {
                  const appointmentDate = new Date(appointment.data);
                  
                  return (
                    <div key={appointment.id} className="flex items-start">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.cliente.nome}</p>
                        <div className="flex mt-1 text-sm text-muted-foreground">
                          <p>{appointment.servico.nome}</p>
                          <span className="mx-2">•</span>
                          <p>
                            {format(appointmentDate, "dd 'de' MMMM", {locale: ptBR})} às {appointment.hora}
                          </p>
                        </div>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="font-medium">{formatCurrency(appointment.servico.valor)}</p>
                        <p className="text-sm text-blue-600">Pendente</p>
                      </div>
                    </div>
                  );
              })}
              
              {recentAppointments.filter(app => app.status === 'agendado').length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Não há agendamentos pendentes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Services and Top Professionals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Serviços Mais Agendados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topServices.length > 0 ? (
              <div className="space-y-4">
                {topServices.map((service, index) => (
                  <div key={service.id} className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{service.name}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{service.count}</span>
                      <span className="text-muted-foreground ml-1">agendamentos</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Não há dados disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Top Professionals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Profissionais Mais Requisitados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topProfessionals.length > 0 ? (
              <div className="space-y-4">
                {topProfessionals.map((professional, index) => (
                  <div key={professional.id} className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{professional.name}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{professional.count}</span>
                      <span className="text-muted-foreground ml-1">agendamentos</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Não há dados disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
