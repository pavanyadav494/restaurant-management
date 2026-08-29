
import React from 'react';
import type { Order } from '../types';
import { OrderStatus } from '../types';
import { CheckCircleIcon, ArrowRightCircleIcon, ArrowPathIcon, ChevronDownIcon, TableCellsIcon, CheckBadgeIcon, CalendarDaysIcon } from './Icons';

interface OrderCardProps {
    order: Order;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, updateOrderStatus }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.SCHEDULED: return 'bg-indigo-500';
            case OrderStatus.PENDING: return 'bg-yellow-500';
            case OrderStatus.PREPARING: return 'bg-blue-500';
            case OrderStatus.READY: return 'bg-green-500';
            case OrderStatus.COMPLETED: return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const nextAction = () => {
        switch (order.status) {
            case OrderStatus.SCHEDULED:
                return { label: 'Confirm & Prepare', action: () => updateOrderStatus(order.id, OrderStatus.PENDING), Icon: ArrowPathIcon };
            case OrderStatus.PENDING:
                return { label: 'Start Preparing', action: () => updateOrderStatus(order.id, OrderStatus.PREPARING), Icon: ArrowPathIcon };
            case OrderStatus.PREPARING:
                return { label: 'Mark as Ready', action: () => updateOrderStatus(order.id, OrderStatus.READY), Icon: ArrowRightCircleIcon };
            case OrderStatus.READY:
                return { label: 'Complete Order', action: () => updateOrderStatus(order.id, OrderStatus.COMPLETED), Icon: CheckCircleIcon };
            case OrderStatus.COMPLETED:
                return { label: 'Clear Table', action: () => updateOrderStatus(order.id, OrderStatus.CLEARED), Icon: CheckBadgeIcon };
            default:
                return null;
        }
    };

    const action = nextAction();
    const timeAgo = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const minutesAgo = Math.round((new Date().getTime() - new Date(order.timestamp).getTime()) / 60000);
    const placedAtTime = new Date(order.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    return (
        <div className={`bg-white rounded-lg shadow-md p-4 transition-all duration-300 border border-stone-200 ${order.isNew ? 'ring-2 ring-amber-500 animate-pulse-fast' : ''} ${order.justUpdated ? 'animate-brief-glow' : ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg text-stone-800">{order.id}</h4>
                    <div className="flex items-center space-x-2 text-amber-700 font-semibold text-sm mt-1">
                        <TableCellsIcon className="h-4 w-4" />
                        <span>Table: {order.tableNumber}</span>
                    </div>
                     {order.scheduledTime ? (
                        <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm mt-1">
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>{new Date(order.scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    ) : (
                         <p className="text-xs text-stone-500 mt-1">
                            {placedAtTime} ({minutesAgo < 1 ? 'just now' : timeAgo.format(-minutesAgo, 'minute')})
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-stone-500 hover:text-stone-800">
                        <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4">
                    <ul className="space-y-1 text-sm text-stone-600">
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

                    {action && (
                        <button onClick={action.action} className="w-full mt-4 bg-amber-700 text-white font-semibold py-2 rounded-lg hover:bg-amber-800 transition-colors flex items-center justify-center text-sm">
                           <action.Icon className="h-5 w-5 mr-2" />
                           {action.label}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderCard;