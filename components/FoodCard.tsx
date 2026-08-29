
import React, { useState } from 'react';
import type { FoodItem, Review } from '../types';
import { PlusCircleIcon, StarIcon } from './Icons';
import ReviewModal from './ReviewModal';

interface FoodCardProps {
    item: FoodItem;
    onAddToCart: () => void;
    onAddReview: (itemId: number, review: Omit<Review, 'timestamp'>) => void;
}

const StarRating: React.FC<{ rating: number, reviewCount: number }> = ({ rating, reviewCount }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <StarIcon key={`full-${i}`} className="h-5 w-5 text-amber-400" />)}
            {/* Note: Simplified to full stars only for this implementation */}
            {[...Array(5 - fullStars)].map((_, i) => <StarIcon key={`empty-${i}`} className="h-5 w-5 text-stone-300" />)}
            <span className="ml-2 text-xs text-stone-500">({reviewCount})</span>
        </div>
    );
};

const FoodCard: React.FC<FoodCardProps> = ({ item, onAddToCart, onAddReview }) => {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const averageRating = item.reviews.length > 0
        ? item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length
        : 0;
    
    const handleReviewSubmit = (review: Omit<Review, 'timestamp'>) => {
        onAddReview(item.id, review);
        setIsReviewModalOpen(false);
    }

    return (
        <>
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col border border-stone-200">
                <img className="w-full h-48 object-cover" src={item.image} alt={item.name} />
                <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                        <h4 className="text-xl font-bold text-stone-800">{item.name}</h4>
                         {item.reviews.length > 0 ? (
                            <StarRating rating={averageRating} reviewCount={item.reviews.length} />
                        ) : (
                             <span className="text-xs text-stone-500 whitespace-nowrap">No reviews</span>
                        )}
                    </div>

                    <p className="text-stone-600 mt-2 text-sm flex-grow">{item.description}</p>
                    
                    <div className="mt-4 space-y-3">
                         <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="w-full text-center bg-stone-100 text-stone-700 px-4 py-2 rounded-full hover:bg-stone-200 transition-colors duration-200 text-sm font-semibold"
                        >
                            Leave a Review
                        </button>
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-extrabold text-amber-600">₹{item.price.toFixed(2)}</span>
                            <button
                                onClick={onAddToCart}
                                className="flex items-center bg-amber-700 text-white px-4 py-2 rounded-full hover:bg-amber-800 transition-colors duration-200 text-sm font-semibold"
                                aria-label={`Add ${item.name} to cart`}
                            >
                                <PlusCircleIcon className="h-5 w-5 mr-2" />
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleReviewSubmit}
                itemName={item.name}
            />
        </>
    );
};

export default FoodCard;