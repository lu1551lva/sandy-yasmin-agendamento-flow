
import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
}

export const StarRating = ({ 
  rating, 
  onRatingChange, 
  readOnly = false, 
  size = 24 
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (readOnly) return;
    onRatingChange(index);
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((index) => {
        const displayRating = hoverRating > 0 ? hoverRating : rating;
        const filled = index <= displayRating;
        
        return (
          <Star
            key={index}
            size={size}
            className={`cursor-${readOnly ? 'default' : 'pointer'} transition-colors ${
              filled ? "fill-gold text-gold" : "text-gray-300"
            } mr-1`}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
};
