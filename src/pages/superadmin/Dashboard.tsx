
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Salon } from "@/lib/supabase";
import { Loader, Users, Calendar, Scissors } from "lucide-react";

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSalons: 0,
    activeSalons: 0,
    trialSalons: 0,
    inactiveSalons: 0,
    totalAppointments: 0,
    totalProfessionals: 0,
    totalServices: 0
  });
  const [recentSalons, setRecentSalons] = useState<Salon[]>([]);

  useEffect(() => {
    const fetchData = async () => {
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

        // Recent salons
        const recentOnes = [...saloes || []].sort((a, b) => {
          return new Date(b.data_cadastro).getTime() - new Date(a.data_cadastro).getTime();
        }).slice(0, 5);

        // Count appointments
        const { count: appointmentsCount, error: appError } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true });
          
        // Count professionals
        const { count: professionalsCount, error: profError } = await supabase
          .from('profissionais')
          .select('*', { count: 'exact', head: true });
          
        // Count services
        const { count: servicesCount, error: servError } = await supabase
          .from('servicos')
          .select('*', { count: 'exact', head: true });

        if (appError || profError || servError) throw new Error('Error fetching counts');
        
        setStats({
          totalSalons: saloes?.length || 0,
          activeSalons: activeSalons.length,
          trialSalons: trialSalons.length,
          inactiveSalons: inactiveSalons.length,
          totalAppointments: appointmentsCount || 0,
          totalProfessionals: professionalsCount || 0,
          totalServices: servicesCount || 0
        });
        
        setRecentSalons(recentOnes);
      } catch (error) {
        console.error('Error fetching super admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Super Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Salões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSalons}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Ativos: {stats.activeSalons} | Trial: {stats.trialSalons} | Inativos: {stats.inactiveSalons}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profissionais</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-primary" />
            <div className="text-2xl font-bold">{stats.totalProfessionals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Serviços</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Scissors className="h-4 w-4 mr-2 text-primary" />
            <div className="text-2xl font-bold">{stats.totalServices}</div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Salões Recentes</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Cadastro</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSalons.map((salon) => (
                <tr key={salon.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{salon.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salon.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salon.url_personalizado}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${salon.plano === 'ativo' ? 'bg-green-100 text-green-800' : 
                      salon.plano === 'trial' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                      {salon.plano}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(salon.data_cadastro).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {recentSalons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum salão cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
