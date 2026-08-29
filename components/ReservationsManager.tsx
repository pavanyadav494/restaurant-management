
import React, { useEffect, useMemo, useState } from 'react';
import type { Order } from '../types';
import { OrderStatus } from '../types';
import { ArrowPathIcon, CalendarDaysIcon, ShoppingBagIcon, TableCellsIcon } from './Icons';

interface ReservationsManagerProps {
    orders: Order[];
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const Countdown: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
    const [timeUntil, setTimeUntil] = useState('');

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const scheduled = new Date(targetDate).getTime();
            const diff = scheduled - now;

            if (diff <= 0) {
                setTimeUntil('Due now');
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeUntil(`in ${hours > 0 ? `${hours}h ` : ''}${minutes}m`);
            }
        };

        updateCountdown();
        const intervalId = setInterval(updateCountdown, 60000); // update every minute
        return () => clearInterval(intervalId);
    }, [targetDate]);

    return <span className="text-lg font-semibold text-amber-600">{timeUntil}</span>;
};


const ReservationCard: React.FC<{ order: Order; onConfirm: (id: string) => void }> = ({ order, onConfirm }) => {
    const isPreorder = order.items.length > 0;
    const cardColor = isPreorder ? 'border-amber-300' : 'border-indigo-300';

    return (
        <div className={`bg-white p-4 rounded-lg border ${cardColor} space-y-3 flex flex-col shadow-sm`}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center space-x-2 text-stone-800 font-semibold text-lg">
                        <TableCellsIcon className="h-5 w-5" />
                        <span>Table {order.tableNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-stone-500 text-sm mt-1">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>{new Date(order.scheduledTime!).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                {order.scheduledTime && <Countdown targetDate={order.scheduledTime} />}
            </div>
            
            <div className="flex-grow">
                {isPreorder && (
                    <div>
                        <ul className="text-sm text-stone-600 space-y-1 max-h-24 overflow-y-auto pr-2">
                            {order.items.map(item => (
                                <li key={item.id} className="flex justify-between">
                                    <span>{item.quantity} x {item.name}</span>
                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-stone-200 mt-2 pt-2 flex justify-between font-bold text-stone-800">
                            <span>Total:</span>
                            <span>₹{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>
            
            <button
                onClick={() => onConfirm(order.id)}
                className="w-full mt-auto bg-amber-700 text-white font-semibold py-2 rounded-lg hover:bg-amber-800 transition-colors flex items-center justify-center text-sm"
            >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Confirm & Move to Pending
            </button>
        </div>
    );
};

const ReservationsManager: React.FC<ReservationsManagerProps> = ({ orders, updateOrderStatus }) => {

    const scheduledOrders = useMemo(() => {
        return orders
            .filter(o => o.status === OrderStatus.SCHEDULED && o.scheduledTime && new Date(o.scheduledTime) > new Date())
            .sort((a, b) => new Date(a.scheduledTime!).getTime() - new Date(b.scheduledTime!).getTime());
    }, [orders]);

    const preordersWithFood = useMemo(() => {
        return scheduledOrders.filter(o => o.items.length > 0);
    }, [scheduledOrders]);

    const tableReservations = useMemo(() => {
        return scheduledOrders.filter(o => o.items.length === 0);
    }, [scheduledOrders]);
    
    const handleConfirm = (orderId: string) => {
        updateOrderStatus(orderId, OrderStatus.PENDING);
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
                    <ShoppingBagIcon className="h-7 w-7 mr-3 text-amber-600" />
                    Upcoming Pre-orders ({preordersWithFood.length})
                </h3>
                {preordersWithFood.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {preordersWithFood.map(order => (
                            <ReservationCard key={order.id} order={order} onConfirm={handleConfirm} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-stone-100 rounded-lg">
                        <p className="text-stone-500">No upcoming pre-orders with food.</p>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
                    <TableCellsIcon className="h-7 w-7 mr-3 text-indigo-600" />
                    Table Reservations Only ({tableReservations.length})
                </h3>
                {tableReservations.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tableReservations.map(order => (
                            <ReservationCard key={order.id} order={order} onConfirm={handleConfirm} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-10 bg-stone-100 rounded-lg">
                        <p className="text-stone-500">No upcoming table-only reservations.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationsManager;
