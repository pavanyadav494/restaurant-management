
import React, { useMemo } from 'react';
import type { CartItem } from '../types';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, ClockIcon, ExclamationTriangleIcon, CalendarDaysIcon } from './Icons';

interface CartFlyoutProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onRemove: (itemId: number) => void;
    onAdd: (item: CartItem) => void;
    onPlaceOrder: () => void;
    preorderDateTime: Date | null;
}

const CartFlyout: React.FC<CartFlyoutProps> = ({ isOpen, onClose, cartItems, onRemove, onAdd, onPlaceOrder, preorderDateTime }) => {
    const hasUnavailableItems = useMemo(() => cartItems.some(item => item.isAvailable === false), [cartItems]);
    const availableItems = useMemo(() => cartItems.filter(item => item.isAvailable !== false), [cartItems]);

    const subtotal = availableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const maxPrepTime = useMemo(() => {
        if (availableItems.length === 0) return 0;
        return Math.max(0, ...availableItems.map(item => item.preparationTime || 0));
    }, [availableItems]);

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'bg-black/50' : 'pointer-events-none bg-transparent'}`} onClick={onClose}>
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-stone-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    <header className="flex items-center justify-between p-4 border-b border-stone-200">
                        <h2 className="text-2xl font-bold text-stone-900">Your Cart</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </header>
                    
                    {cartItems.length === 0 ? (
                         <div className="flex-grow flex flex-col items-center justify-center text-stone-500 p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-stone-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <p className="text-xl">Your cart is empty.</p>
                            <p className="mt-2 text-sm">Add some delicious food to get started!</p>
                        </div>
                    ) : (
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-stone-50/50">
                            {cartItems.map(item => {
                                const isUnavailable = item.isAvailable === false;
                                return (
                                <div key={item.id} className={`flex items-start space-x-4 bg-white p-3 rounded-lg transition-opacity border border-stone-200 ${isUnavailable ? 'opacity-60' : ''}`}>
                                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-stone-800">{item.name}</p>
                                        <p className={`text-sm ${isUnavailable ? 'text-stone-400 line-through' : 'text-amber-600'}`}>₹{item.price.toFixed(2)}</p>
                                        
                                        {isUnavailable ? (
                                            <div className="mt-1 flex items-center text-xs text-red-600">
                                                <ExclamationTriangleIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                                <span>Currently unavailable</span>
                                            </div>
                                        ) : (
                                            item.preparationTime && item.preparationTime > 0 && (
                                                <div className="mt-1 flex items-center text-xs text-stone-500">
                                                    <ClockIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                                    <span>~{item.preparationTime} min prep time</span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 bg-stone-100 rounded-full p-1">
                                        <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-full hover:bg-stone-200 transition-colors">
                                            {item.quantity > 1 ? <MinusIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4 text-red-500"/>}
                                        </button>
                                        <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                                        <button onClick={() => onAdd(item)} className="p-1.5 rounded-full hover:bg-stone-200 transition-colors" disabled={isUnavailable}>
                                            <PlusIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                )}
                            )}
                        </div>
                    )}
                    
                    <footer className="p-4 border-t border-stone-200 bg-stone-50">
                        {preorderDateTime && (
                            <div className="mb-3 p-3 bg-amber-100 text-amber-800 text-sm rounded-lg flex items-start space-x-3">
                                <CalendarDaysIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>This order is scheduled for {preorderDateTime.toLocaleDateString([], { month: 'long', day: 'numeric' })} at {preorderDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.</p>
                            </div>
                        )}
                        {hasUnavailableItems && (
                            <div className="mb-3 p-3 bg-red-100 text-red-800 text-sm rounded-lg flex items-start space-x-2">
                                <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <p>Some items are unavailable. Please remove them to proceed with your order.</p>
                            </div>
                        )}
                        <div className="mb-4">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-medium text-stone-600">Subtotal</span>
                                <span className="text-2xl font-bold text-amber-700">₹{subtotal.toFixed(2)}</span>
                            </div>
                            {maxPrepTime > 0 && !preorderDateTime && (
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="font-medium text-stone-500">Estimated prep time</span>
                                    <span className="font-semibold text-stone-700">~{maxPrepTime} minutes</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onPlaceOrder}
                            disabled={availableItems.length === 0 || hasUnavailableItems}
                            className="w-full bg-amber-700 text-white font-bold py-3 rounded-lg hover:bg-amber-800 transition-colors duration-200 disabled:bg-stone-300 disabled:cursor-not-allowed"
                        >
                            {preorderDateTime ? 'Place Pre-order' : 'Place Order'}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default CartFlyout;