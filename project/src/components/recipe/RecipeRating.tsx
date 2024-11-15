import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useRecipes } from '../../contexts/RecipeContext';
import { useUser } from '../../contexts/UserContext';

interface RecipeRatingProps {
  recipeId: string;
  initialRating?: number;
  totalRatings?: number;
  userRating?: number;
  className?: string;
}

export const RecipeRating: React.FC<RecipeRatingProps> = ({
  recipeId,
  initialRating = 0,
  totalRatings = 0,
  userRating = 0,
  className = '',
}) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { rateRecipe } = useRecipes();
  const { user } = useUser();

  const handleRating = async (rating: number) => {
    if (!user || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await rateRecipe(recipeId, rating);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStar = (index: number) => {
    const filled = hoveredStar !== null 
      ? index <= hoveredStar 
      : index <= (userRating || initialRating);

    return (
      <button
        key={index}
        onClick={() => handleRating(index)}
        onMouseEnter={() => setHoveredStar(index)}
        onMouseLeave={() => setHoveredStar(null)}
        disabled={!user || isSubmitting}
        className={`text-2xl transition-colors ${
          filled ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-400 disabled:cursor-not-allowed`}
      >
        <Star className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} />
      </button>
    );
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map(index => renderStar(index))}
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {initialRating.toFixed(1)} ({totalRatings} avis)
      </span>
    </div>
  );
};