
import { Salon } from "@/lib/supabase";

interface RecentSalonsTableProps {
  salons: Salon[];
}

export const RecentSalonsTable = ({ salons }: RecentSalonsTableProps) => {
  return (
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
            {salons.map((salon) => (
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
            {salons.length === 0 && (
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
  );
};
