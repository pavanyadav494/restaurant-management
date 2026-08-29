
import React, { useMemo } from 'react';
import type { FoodItem, Review } from '../types';
import { StarIcon } from './Icons';

interface ReviewManagerProps {
    menu: FoodItem[];
}

interface ReviewWithItem extends Review {
    itemName: string;
    itemId: number;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`h-5 w-5 ${i < rating ? 'text-amber-400' : 'text-stone-300'}`} />
            ))}
        </div>
    );
};


const ReviewManager: React.FC<ReviewManagerProps> = ({ menu }) => {
    const allReviews = useMemo(() => {
        const reviews: ReviewWithItem[] = [];
        menu.forEach(item => {
            item.reviews.forEach(review => {
                reviews.push({
                    ...review,
                    itemName: item.name,
                    itemId: item.id,
                });
            });
        });
        // Sort by most recent first
        return reviews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [menu]);

    return (
        <div className="bg-white border border-stone-200 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-stone-800 mb-6">Customer Reviews ({allReviews.length})</h3>
            {allReviews.length > 0 ? (
                <div className="space-y-4">
                    {allReviews.map((review, index) => (
                        <div key={`${review.itemId}-${review.author}-${index}`} className="bg-stone-50 border border-stone-200 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-stone-800">{review.author}</p>
                                    <p className="text-sm text-stone-500">
                                        reviewed <span className="font-medium text-amber-700">{review.itemName}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <StarRating rating={review.rating} />
                                    <p className="text-xs text-stone-400 mt-1">
                                        {review.timestamp.toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-stone-700 italic">"{review.comment}"</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-stone-500 text-center py-10">No reviews have been submitted yet.</p>
            )}
        </div>
    );
};

export default ReviewManager;