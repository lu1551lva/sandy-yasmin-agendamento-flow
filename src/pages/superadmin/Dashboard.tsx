
import { Calendar, Users, Scissors } from "lucide-react";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { RecentSalonsTable } from "@/components/admin/dashboard/RecentSalonsTable";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRecentSalons } from "@/hooks/useRecentSalons";
import { StatCardGrid } from "@/components/admin/dashboard/StatCardSkeleton";

const SuperAdminDashboard = () => {
  const { stats, loading } = useDashboardStats();
  const recentSalons = useRecentSalons();
  
  if (loading) {
    return <StatCardGrid />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Super Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total de Salões"
          value={stats.totalSalons}
          description={`Ativos: ${stats.activeSalons} | Trial: ${stats.trialSalons} | Inativos: ${stats.inactiveSalons}`}
        />
        
        <StatsCard 
          title="Agendamentos"
          value={stats.totalAppointments}
          icon={Calendar}
        />
        
        <StatsCard 
          title="Profissionais"
          value={stats.totalProfessionals}
          icon={Users}
        />
        
        <StatsCard 
          title="Serviços"
          value={stats.totalServices}
          icon={Scissors}
        />
      </div>
      
      <RecentSalonsTable salons={recentSalons} />
    </div>
  );
};

export default SuperAdminDashboard;
