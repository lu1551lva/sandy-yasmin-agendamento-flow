
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { StarRating } from "@/components/reviews/StarRating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { formatDate } from "@/lib/dateUtils";
import { Loader } from "lucide-react";

interface ProfessionalReviewsProps {
  professionalId: string;
}

export const ProfessionalReviews = ({ professionalId }: ProfessionalReviewsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const { data, isLoading } = useQuery({
    queryKey: ["professional-reviews", professionalId, currentPage],
    queryFn: async () => {
      const startIndex = (currentPage - 1) * limit;
      
      const { data, error, count } = await supabase
        .from("appointment_reviews")
        .select("*", { count: "exact" })
        .eq("profissional_id", professionalId)
        .order("created_at", { ascending: false })
        .range(startIndex, startIndex + limit - 1);
      
      if (error) throw error;
      
      if (count !== null) {
        setTotalPages(Math.ceil(count / limit));
      }
      
      return {
        reviews: data,
        averageRating: data.length > 0 
          ? (data.reduce((sum, review) => sum + review.rating, 0) / data.length).toFixed(1) 
          : '0.0'
      };
    },
    enabled: !!professionalId
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!data || data.reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-muted-foreground">
            Este profissional ainda não possui avaliações.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Avaliações</CardTitle>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{data.averageRating}</span>
            <StarRating rating={parseFloat(data.averageRating)} readOnly size={18} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.reviews.map((review: any) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <StarRating rating={review.rating} readOnly size={18} />
                <span className="text-xs text-muted-foreground">
                  {formatDate(new Date(review.created_at))}
                </span>
              </div>
              <p className="text-sm font-medium mb-1">{review.cliente_nome}</p>
              {review.comment && (
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="mt-4">
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
