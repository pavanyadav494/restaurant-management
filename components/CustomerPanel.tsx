
import React, { useState, useMemo } from 'react';
import type { FoodItem, CartItem, Review, Order } from '../types';
import FoodCard from './FoodCard';
import CartFlyout from './CartFlyout';
import OrderTracker from './OrderTracker';
import TableSelectionView from './TableSelectionView';
import PreorderChoiceModal from './PreorderChoiceModal';
import { ShoppingBagIcon, MagnifyingGlassIcon, ReceiptIcon, TableCellsIcon, ArrowLeftOnRectangleIcon, CalendarDaysIcon, ClockIcon } from './Icons';
import { TOTAL_TABLES } from '../constants';

interface CustomerPanelProps {
    menu: FoodItem[];
    cart: CartItem[];
    addToCart: (item: FoodItem) => void;
    removeFromCart: (itemId: number) => void;
    placeOrder: () => void;
    onAddReview: (itemId: number, review: Omit<Review, 'timestamp'>) => void;
    unavailableTables: number[];
    orders: Order[];
    customerTable: number | null;
    onSelectTable: (table: number) => void;
    onLeaveTable: () => void;
    clearCart: () => void;
    qrCodeUrl: string;
    preorderDateTime: Date | null;
    onSetPreorderDateTime: (date: Date | null) => void;
    addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
    placeReservationOnlyOrder: (table: number, dateTime: Date) => Promise<void>;
    recipientName: string;
    upiId: string;
}

type SortByType = 'default' | 'rating' | 'price-asc' | 'price-desc';

const getAverageRating = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
};

const CustomerPanel: React.FC<CustomerPanelProps> = (props) => {
    const { 
        menu, cart, addToCart, removeFromCart, placeOrder, onAddReview, unavailableTables, 
        orders, customerTable, onSelectTable, onLeaveTable, clearCart, qrCodeUrl,
        preorderDateTime, onSetPreorderDateTime, addNotification, placeReservationOnlyOrder,
        recipientName, upiId
    } = props;
    
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [sortBy, setSortBy] = useState<SortByType>('default');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTrackerVisible, setIsTrackerVisible] = useState(true);
    const [preorderChoice, setPreorderChoice] = useState<{table: number; dateTime: Date} | null>(null);

    const categories = ['All', ...new Set(menu.map(item => item.category))];
    const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

    const tableOrders = useMemo(() =>
        orders
            .filter(o => o.tableNumber === customerTable && o.status !== 'Cleared')
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [orders, customerTable]);

    const handleLeaveAndConfirm = () => {
        if (cart.length > 0) {
            if (window.confirm("You have items in your cart. Are you sure you want to leave the table? Your cart will be cleared.")) {
                clearCart();
                onLeaveTable();
            }
        } else {
            onLeaveTable();
        }
    };
    
    const handleDecideLater = async () => {
        if (!preorderChoice) return;
        await placeReservationOnlyOrder(preorderChoice.table, preorderChoice.dateTime);
        setPreorderChoice(null);
        onLeaveTable();
    };


    const filteredAndSortedMenu = useMemo(() => {
        let items = menu.filter(item => item.isAvailable !== false);
        
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            items = items.filter(item => 
                item.name.toLowerCase().includes(lowercasedQuery) || 
                item.description.toLowerCase().includes(lowercasedQuery)
            );
        }

        if (selectedCategory !== 'All') {
            items = items.filter(item => item.category === selectedCategory);
        }

        switch (sortBy) {
            case 'rating':
                items.sort((a, b) => getAverageRating(b.reviews) - getAverageRating(a.reviews));
                break;
            case 'price-asc':
                items.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                items.sort((a, b) => b.price - a.price);
                break;
            default:
                items.sort((a, b) => a.id - b.id);
                break;
        }
        return items;
    }, [menu, selectedCategory, sortBy, searchQuery]);

    if (!customerTable && !preorderChoice) {
        return <TableSelectionView 
            totalTables={TOTAL_TABLES}
            unavailableTables={unavailableTables}
            onSelectTable={(table) => {
                if (preorderDateTime) {
                    setPreorderChoice({ table, dateTime: preorderDateTime });
                } else {
                    onSelectTable(table);
                }
            }}
            onPreorderDateTimeChange={onSetPreorderDateTime}
            addNotification={addNotification}
        />
    }

    if (preorderChoice) {
        return <PreorderChoiceModal
            tableNumber={preorderChoice.table}
            dateTime={preorderChoice.dateTime}
            onOrderNow={() => {
                onSelectTable(preorderChoice.table);
                setPreorderChoice(null);
            }}
            onDecideLater={handleDecideLater}
        />
    }

    if (tableOrders.length > 0 && isTrackerVisible) {
        return <OrderTracker 
            orders={tableOrders}
            onViewMenu={() => setIsTrackerVisible(false)}
            qrCodeUrl={qrCodeUrl}
            recipientName={recipientName}
            upiId={upiId}
        />;
    }

    return (
        <div className="relative animate-fadeIn">
            <div className="p-4 bg-white/60 rounded-xl sticky top-20 z-30 backdrop-blur-sm mb-4 flex items-center justify-between shadow-sm border border-stone-200">
                <div>
                    <span className="text-stone-600 font-medium">Your Location:</span>
                    <div className="flex items-center space-x-2 text-amber-700 font-semibold text-lg">
                        <TableCellsIcon className="h-5 w-5" />
                        <span>Table {customerTable}</span>
                    </div>
                </div>
                <button
                    onClick={handleLeaveAndConfirm}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    <span>Leave Table</span>
                </button>
            </div>
            
            {preorderDateTime && (
                 <div className="p-4 bg-amber-100 text-amber-800 rounded-xl mb-8 flex items-center justify-center space-x-3 shadow-sm text-center">
                    <CalendarDaysIcon className="h-6 w-6 flex-shrink-0" />
                    <p className="font-semibold text-sm sm:text-base">
                        Pre-ordering for: {preorderDateTime.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            )}

            <h2 className="text-4xl font-extrabold text-center mb-6 tracking-tight text-stone-900 sm:text-5xl font-cinzel">Our Menu</h2>
            
            <div className="mb-8 p-4 bg-white/60 backdrop-blur-sm border border-stone-200 rounded-xl">
                 <div className="flex flex-col gap-4">
                    <div className="relative w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3" aria-hidden="true">
                            <MagnifyingGlassIcon className="h-5 w-5 text-stone-400" />
                        </span>
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search menu by name or description..."
                            className="w-full bg-white border border-stone-300 rounded-full py-2 pl-10 pr-4 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            aria-label="Search menu"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                                        selectedCategory === category
                                            ? 'bg-amber-700 text-white'
                                            : 'bg-white text-stone-700 hover:bg-amber-100 border border-stone-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        <div className="w-full sm:w-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortByType)}
                                className="w-full sm:w-48 bg-white border border-stone-300 rounded-full px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                aria-label="Sort menu items"
                            >
                                <option value="default">Sort by...</option>
                                <option value="rating">Highest Rated</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredAndSortedMenu.length > 0 ? (
                    filteredAndSortedMenu.map(item => (
                        <FoodCard key={item.id} item={item} onAddToCart={() => addToCart(item)} onAddReview={onAddReview} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-16">
                        <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-stone-500" />
                        <h3 className="mt-4 text-2xl font-semibold text-stone-800">No dishes found</h3>
                        <p className="mt-2 text-stone-600">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
            
            {tableOrders.length > 0 && !isTrackerVisible && (
                <button
                    onClick={() => setIsTrackerVisible(true)}
                    className="fixed bottom-24 right-8 bg-amber-700 hover:bg-amber-800 text-white font-bold p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 focus:ring-amber-500 z-40"
                    aria-label="Track Your Order"
                >
                    <ReceiptIcon className="h-8 w-8" />
                </button>
            )}

            <button
                onClick={() => setIsCartOpen(true)}
                className="fixed bottom-8 right-8 bg-amber-700 hover:bg-amber-800 text-white font-bold p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 focus:ring-amber-600"
                aria-label="Open Cart"
            >
                <ShoppingBagIcon className="h-8 w-8" />
                {totalItemsInCart > 0 && (
                    <span className="absolute -top-2 -right-2 flex items-center justify-center h-7 w-7 bg-red-500 text-white text-xs font-bold rounded-full">
                        {totalItemsInCart}
                    </span>
                )}
            </button>

            <CartFlyout 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                onRemove={removeFromCart}
                onAdd={(item) => addToCart(item)}
                onPlaceOrder={() => {
                    placeOrder();
                    setIsCartOpen(false);
                }}
                preorderDateTime={preorderDateTime}
            />
        </div>
    );
};

export default CustomerPanel;