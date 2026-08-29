
import React, { useState } from 'react';
import type { Review } from '../types';
import { XMarkIcon, StarIcon } from './Icons';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (review: Omit<Review, 'timestamp'>) => void;
    itemName: string;
}

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
);

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, itemName }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [author, setAuthor] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0 && author.trim() && comment.trim()) {
            onSubmit({ author, rating, comment });
            // Reset form
            setRating(0);
            setComment('');
            setAuthor('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative border border-stone-200" onClick={e => e.stopPropagation()}>
                <h4 className="text-2xl font-bold mb-2 text-center text-stone-800">Leave a review for</h4>
                <p className="text-center text-amber-700 font-semibold mb-6">{itemName}</p>
                
                <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="space-y-4">
                    <div className="text-center">
                        <label className="block text-sm font-medium text-stone-700 mb-2">Your Rating</label>
                        <div className="flex justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                    key={star}
                                    className={`h-10 w-10 cursor-pointer transition-colors ${
                                        (hoverRating || rating) >= star ? 'text-amber-400' : 'text-stone-300'
                                    }`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                />
                            ))}
                        </div>
                    </div>
                     <InputField name="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Your Name" required />
                     <div>
                        <textarea name="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder={`What did you think of the ${itemName}?`} required className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" rows={4}></textarea>
                    </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-stone-800 bg-stone-200 hover:bg-stone-300 font-semibold transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 rounded-lg text-white bg-amber-700 hover:bg-amber-800 font-semibold transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed" disabled={!rating || !author || !comment}>Submit Review</button>
                </div>
            </form>
        </div>
    );
};

export default ReviewModal;