
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/reviews/StarRating";
import { formatDate } from "@/lib/dateUtils";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ReviewWithDetails {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  cliente_nome: string;
  profissional_nome: string;
  servico_nome: string;
}

export const RecentReviews = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as ReviewWithDetails[];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Avaliações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Avaliações Recentes</CardTitle>
        <Button variant="outline" asChild size="sm">
          <Link to="/admin/avaliacoes">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <StarRating rating={review.rating} readOnly size={18} />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(review.created_at))}
                  </span>
                </div>
                <div className="text-sm mb-1">
                  <span className="font-medium">{review.cliente_nome}</span> • {review.servico_nome}
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            Nenhuma avaliação ainda
          </div>
        )}
      </CardContent>
    </Card>
  );
};
