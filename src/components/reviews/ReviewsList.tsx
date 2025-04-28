
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Review } from "@/types/review.types";
import { ReviewDisplay } from "@/components/reviews/ReviewDisplay";
import { Loader } from "lucide-react";
import { DataTablePagination } from "@/components/common/DataTablePagination";

interface ReviewsListProps {
  professionalId?: string;
  limit?: number;
  showPagination?: boolean;
}

export const ReviewsList = ({ 
  professionalId, 
  limit = 10, 
  showPagination = true 
}: ReviewsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews", professionalId, currentPage, limit],
    queryFn: async () => {
      const startIndex = (currentPage - 1) * limit;
      
      let query = supabase
        .from("reviews")
        .select(`
          *,
          agendamento:agendamentos(
            profissional:profissionais(*)
          )
        `)
        .order("created_at", { ascending: false })
        .range(startIndex, startIndex + limit - 1);
      
      if (professionalId) {
        query = query.eq("agendamento.profissional_id", professionalId);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Calculate total pages if count is provided
      if (count !== null) {
        setTotalPages(Math.ceil(count / limit));
      }
      
      return data as (Review & {
        agendamento: {
          profissional: {
            id: string;
            nome: string;
          }
        }
      })[];
    }
  });

  // Get total count for pagination
  useEffect(() => {
    const fetchTotalCount = async () => {
      let query = supabase
        .from("reviews")
        .select("id", { count: "exact" });
      
      if (professionalId) {
        query = query.eq("agendamento.profissional_id", professionalId);
      }
      
      const { count, error } = await query;
      
      if (!error && count !== null) {
        setTotalPages(Math.ceil(count / limit));
      }
    };
    
    fetchTotalCount();
  }, [professionalId, limit]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">
        Erro ao carregar avaliações
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Nenhuma avaliação encontrada
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {data.map((review) => (
          <ReviewDisplay key={review.id} review={review} />
        ))}
      </div>
      
      {showPagination && totalPages > 1 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
