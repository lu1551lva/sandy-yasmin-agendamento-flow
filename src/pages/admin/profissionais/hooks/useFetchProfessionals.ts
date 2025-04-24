
import { useQuery } from "@tanstack/react-query";
import { Professional, supabase } from "@/lib/supabase";

export function useFetchProfessionals() {
  return useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      console.log("Buscando profissionais...");
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("nome");
        
      if (error) {
        console.error("Erro ao buscar profissionais:", error);
        throw error;
      }
      
      console.log("Profissionais encontrados:", data);
      return data as Professional[];
    },
  });
}
