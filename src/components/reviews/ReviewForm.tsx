
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/reviews/StarRating";
import { ReviewFormData } from "@/types/review.types";
import { supabase } from "@/lib/supabase";

interface ReviewFormProps {
  appointmentId: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ appointmentId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma classificação de 1 a 5 estrelas",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          appointment_id: appointmentId,
          rating,
          comment: comment.trim() || null,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Avaliação enviada",
        description: "Obrigado pelo seu feedback!",
      });

      // Update appointment status if needed
      await supabase
        .from("agendamentos")
        .update({ avaliado: true })
        .eq("id", appointmentId);

      if (onSuccess) onSuccess();
      
      // Reset form
      setRating(0);
      setComment("");
    } catch (error: any) {
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Sua avaliação</label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Comentário (opcional)
        </label>
        <Textarea
          id="comment"
          placeholder="Compartilhe sua experiência..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
      </Button>
    </form>
  );
};
