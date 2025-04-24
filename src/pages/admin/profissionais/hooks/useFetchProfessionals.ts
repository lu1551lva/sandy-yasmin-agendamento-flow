
import { useQuery } from "@tanstack/react-query";
import { Professional, supabase } from "@/lib/supabase";

interface UseFetchProfessionalsProps {
  page: number;
  pageSize: number;
}

export interface ProfessionalsResponse {
  data: Professional[];
  total: number;
}

export function useFetchProfessionals({ page, pageSize }: UseFetchProfessionalsProps) {
  return useQuery({
    queryKey: ["professionals", page, pageSize],
    queryFn: async (): Promise<ProfessionalsResponse> => {
      console.log("Buscando profissionais...");
      
      // Primeiro, buscar o total de registros
      const countResponse = await supabase
        .from("profissionais")
        .select("id", { count: "exact", head: true });
        
      const total = countResponse.count || 0;

      // Depois, buscar os dados paginados
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("nome")
        .range((page - 1) * pageSize, page * pageSize - 1);
        
      if (error) {
        console.error("Erro ao buscar profissionais:", error);
        throw error;
      }
      
      console.log("Profissionais encontrados:", data);
      return {
        data: data as Professional[],
        total,
      };
    },
  });
}
