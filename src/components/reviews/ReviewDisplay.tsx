
import { formatDate } from "@/lib/dateUtils";
import { StarRating } from "@/components/reviews/StarRating";
import { Review } from "@/types/review.types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ReviewDisplayProps {
  review: Review;
}

export const ReviewDisplay = ({ review }: ReviewDisplayProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <StarRating rating={review.rating} readOnly size={20} />
          <span className="text-xs text-muted-foreground">
            {formatDate(new Date(review.created_at))}
          </span>
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
  );
};
