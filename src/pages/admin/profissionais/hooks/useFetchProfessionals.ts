
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface UseFetchProfessionalsProps {
  page: number;
  pageSize: number;
}

export function useFetchProfessionals({ 
  page, 
  pageSize
}: UseFetchProfessionalsProps) {
  return useQuery({
    queryKey: ["professionals", page, pageSize],
    queryFn: async () => {
      console.log("Fetching professionals");
      const startIndex = (page - 1) * pageSize;
      
      // Build query without salon filter since this is single-tenant now
      const { data, error, count } = await supabase
        .from("profissionais")
        .select("*", { count: "exact" })
        .range(startIndex, startIndex + pageSize - 1)
        .order("nome", { ascending: true });

      if (error) {
        console.error("Error fetching professionals:", error);
        throw error;
      }

      return {
        data: data || [],
        total: count || 0
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
