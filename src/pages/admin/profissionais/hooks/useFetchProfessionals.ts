
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface UseFetchProfessionalsProps {
  page: number;
  pageSize: number;
  salaoId?: string | null;
}

export function useFetchProfessionals({ 
  page, 
  pageSize,
  salaoId
}: UseFetchProfessionalsProps) {
  return useQuery({
    queryKey: ["professionals", page, pageSize, salaoId],
    queryFn: async () => {
      console.log("Fetching professionals for salon:", salaoId);
      const startIndex = (page - 1) * pageSize;
      
      // Build query with conditional filters
      let query = supabase
        .from("profissionais")
        .select("*", { count: "exact" });
        
      // Add salon filter if salaoId is available
      if (salaoId) {
        query = query.eq("salao_id", salaoId);
      }
      
      // Execute query with pagination
      const { data, error, count } = await query
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
