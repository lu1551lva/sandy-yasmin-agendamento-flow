
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/reviews/StarRating";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { formatDate } from "@/lib/dateUtils";
import { Loader } from "lucide-react";
import { useState } from "react";

interface ReviewWithDetails {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  cliente_nome: string;
  profissional_nome: string;
  servico_nome: string;
}

const AdminReviews = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", currentPage],
    queryFn: async () => {
      const startIndex = (currentPage - 1) * limit;
      
      const { data, error, count } = await supabase
        .from("appointment_reviews")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(startIndex, startIndex + limit - 1);
      
      if (error) throw error;
      
      if (count !== null) {
        setTotalPages(Math.ceil(count / limit));
      }
      
      return data as ReviewWithDetails[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Avaliações de Clientes</h1>
      
      <div className="grid gap-6">
        {data && data.length > 0 ? (
          data.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center mb-2">
                  <StarRating rating={review.rating} readOnly size={20} />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(review.created_at))}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Cliente: </span>
                  <span className="text-sm">{review.cliente_nome}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Serviço: </span>
                  <span className="text-sm">{review.servico_nome}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Profissional: </span>
                  <span className="text-sm">{review.profissional_nome}</span>
                </div>
              </CardHeader>
              <CardContent>
                {review.comment ? (
                  <p className="text-sm">{review.comment}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sem comentário</p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            Nenhuma avaliação encontrada
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-6">
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
