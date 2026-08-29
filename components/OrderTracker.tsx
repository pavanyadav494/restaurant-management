
import React, { useState, useMemo } from 'react';
import type { Order } from '../types';
import { OrderStatus } from '../types';
import { ClockIcon, FireIcon, BellIcon, CheckCircleIcon, ShoppingBagIcon, BookOpenIcon, ChevronDownIcon, QrCodeIcon, XMarkIcon, CalendarDaysIcon } from './Icons';

interface OrderTrackerProps {
    orders: Order[];
    onViewMenu: () => void;
    qrCodeUrl: string;
    recipientName: string;
    upiId: string;
}

const statusSteps = [
    { status: OrderStatus.SCHEDULED, label: 'Scheduled', Icon: CalendarDaysIcon },
    { status: OrderStatus.PENDING, label: 'Pending', Icon: ClockIcon },
    { status: OrderStatus.PREPARING, label: 'Preparing', Icon: FireIcon },
    { status: OrderStatus.READY, label: 'Ready', Icon: BellIcon },
    { status: OrderStatus.COMPLETED, label: 'Completed', Icon: CheckCircleIcon },
];

const IndividualOrderDisplay: React.FC<{ order: Order, onPay: () => void }> = ({ order, onPay }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const currentStatusIndex = statusSteps.findIndex(step => step.status === order.status);
    const placedAtTime = new Date(order.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const itemSummary = order.items
        .slice(0, 2)
        .map(item => `${item.quantity}x ${item.name}`)
        .join(', ');
    const hasMoreItems = order.items.length > 2;

    const estimatedPrepTime = useMemo(() => {
        if (!order.items || order.items.length === 0) return 0;
        return Math.max(0, ...order.items.map(item => item.preparationTime || 0));
    }, [order.items]);
    
    const progress = currentStatusIndex < 0 ? 0 : currentStatusIndex / (statusSteps.length - 1);

    return (
        <div className="bg-stone-50 rounded-xl p-4 sm:p-6 shadow-md border border-stone-200">
            <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                 <div>
                    <h3 className="font-bold text-xl text-amber-700">{order.id}</h3>
                    <p className="text-xs text-stone-500 mt-1">
                        {order.scheduledTime 
                            ? `Scheduled for ${new Date(order.scheduledTime).toLocaleDateString()}`
                            : `Placed at ${placedAtTime}`
                        }
                    </p>
                    {estimatedPrepTime > 0 && (order.status === OrderStatus.PENDING || order.status === OrderStatus.PREPARING) && (
                        <div className="mt-2 flex items-center text-sm font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-full w-fit">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            <span>Estimated Prep Time: {estimatedPrepTime} min</span>
                        </div>
                    )}
                    {!isExpanded && (
                        <p className="text-sm text-stone-600 mt-2 pr-2">
                            {itemSummary}{hasMoreItems && ', ...'}
                        </p>
                    )}
                </div>
                <div className="flex-shrink-0 flex items-center space-x-2 pl-2">
                     <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${order.status === 'Completed' ? 'bg-green-600' : 'bg-amber-700'}`}>
                        {order.status}
                    </span>
                    <ChevronDownIcon className={`h-6 w-6 text-stone-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Status Progress Bar */}
            <div className="relative my-8">
                {/* The progress bar line, positioned behind the steps */}
                <div className="absolute top-6 left-0 right-0 h-1.5 -translate-y-1/2 bg-stone-200 rounded-full mx-6 sm:mx-12">
                    <div 
                        className="h-1.5 bg-amber-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progress * 100}%` }}
                    ></div>
                </div>

                {/* The steps, on top of the line */}
                <div className="relative flex justify-between items-start">
                    {statusSteps.map((step, index) => {
                         // Don't show "Scheduled" step for non-scheduled orders
                        if (!order.scheduledTime && step.status === OrderStatus.SCHEDULED) {
                            return null;
                        }
                        const isActive = index <= currentStatusIndex;
                        return (
                            <div key={step.status} className="flex flex-col items-center text-center w-16 sm:w-24 z-10">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center border-4 bg-stone-50 transition-colors duration-300 ${isActive ? 'border-amber-500' : 'border-stone-200'}`}>
                                    <step.Icon className={`h-6 w-6 transition-colors duration-300 ${isActive ? 'text-amber-500' : 'text-stone-400'}`} />
                                </div>
                                <p className={`mt-2 font-semibold text-xs sm:text-sm transition-colors duration-300 ${isActive ? 'text-stone-800' : 'text-stone-500'}`}>{step.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CLEARED && (
                <div className="my-6">
                    <button
                        onClick={onPay}
                        className="w-full flex items-center justify-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 text-lg transform hover:scale-105"
                    >
                        <QrCodeIcon className="h-6 w-6 mr-3" />
                        Pay ₹{order.total.toFixed(2)} Online
                    </button>
                </div>
            )}

            {/* Collapsible Summary */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                 <h4 className="font-bold text-lg mb-2 text-stone-800">Order Summary</h4>
                <ul className="space-y-2 text-sm text-stone-700">
                    {order.items.map(item => (
                        <li key={item.id} className="flex justify-between items-center bg-stone-100 p-2 rounded-md">
                            <div>
                                <span className="font-semibold text-amber-700">{item.quantity} x</span>
                                <span className="ml-2 text-stone-800">{item.name}</span>
                            </div>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="border-t border-stone-200 mt-3 pt-3 flex justify-between font-bold text-base text-stone-800">
                    <span>Total:</span>
                    <span className="text-amber-700">₹{order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    )
}

interface PaymentModalProps {
    order: Order;
    qrCodeUrl: string;
    recipientName: string;
    upiId: string;
    onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ order, qrCodeUrl, recipientName, upiId, onClose }) => {
    const [copied, setCopied] = useState(false);

    const upiUrl = useMemo(() => {
        if (!upiId || !recipientName) return '';
        const params = new URLSearchParams({
            pa: upiId,
            pn: recipientName,
            am: order.total.toFixed(2),
            cu: 'INR',
            tn: `Order ${order.id}`,
        });
        return `upi://pay?${params.toString()}`;
    }, [upiId, recipientName, order.total, order.id]);

    const qrCodeToDisplay = useMemo(() => {
        if (upiUrl) {
            return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(upiUrl)}`;
        }
        return qrCodeUrl; // Fallback to admin-uploaded QR
    }, [upiUrl, qrCodeUrl]);
    
    const copyUpiId = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(upiId).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-sm relative border border-stone-200 text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-stone-900 font-cinzel">Scan & Pay</h3>
                <p className="text-stone-500 mt-1">Order ID: {order.id}</p>
                
                <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="my-6 p-4 bg-white rounded-lg inline-block shadow-inner">
                    <img src={qrCodeToDisplay} alt="Payment QR Code" className="h-48 w-48 sm:h-56 sm:w-56" />
                </div>
                
                <div className="bg-stone-50 p-4 rounded-lg">
                    <p className="text-lg text-stone-600">Total Amount</p>
                    <p className="text-4xl font-extrabold text-amber-700 tracking-tight">₹{order.total.toFixed(2)}</p>
                </div>
                
                <div className="my-6 space-y-3">
                     <a href={upiUrl} className="block w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center">
                        Pay using any UPI App
                    </a>
                    <div className="bg-stone-50 p-3 rounded-lg flex items-center justify-between text-left">
                        <p className="text-stone-600 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                            UPI ID: <span className="font-semibold text-stone-800">{upiId}</span>
                        </p>
                        <button onClick={copyUpiId} className="text-amber-600 font-semibold text-sm hover:text-amber-500 flex-shrink-0 ml-2 px-3 py-1 bg-stone-200 rounded-md">
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                <p className="text-xs text-stone-500 mt-4">The order status will not update automatically after payment. Please show payment confirmation to staff.</p>
            </div>
        </div>
    );
};


const OrderTracker: React.FC<OrderTrackerProps> = ({ orders, onViewMenu, qrCodeUrl, recipientName, upiId }) => {
    const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
    const allOrdersCompleted = orders.every(o => o.status === OrderStatus.COMPLETED);

    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            <div className="bg-white/70 backdrop-blur-sm border border-stone-200 rounded-xl p-6 sm:p-8 shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-stone-900 font-cinzel">Track Your Orders</h2>
                    <p className="mt-2 text-stone-600">
                        Real-time status for all orders at Table {orders[0]?.tableNumber}.
                    </p>
                </div>

                <div className="space-y-8">
                    {orders.map(order => (
                        <IndividualOrderDisplay key={order.id} order={order} onPay={() => setPaymentOrder(order)} />
                    ))}
                </div>

                {allOrdersCompleted ? (
                    <div className="mt-8 text-center">
                        <p className="text-green-600 font-semibold mb-4 text-lg">All your orders are complete. Enjoy your meal!</p>
                        <button
                            onClick={onViewMenu}
                            className="flex items-center justify-center w-full sm:w-auto mx-auto bg-amber-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-800 transition-colors duration-200"
                        >
                            <ShoppingBagIcon className="h-5 w-5 mr-2" />
                            Place Another Order
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 p-5 bg-stone-50 rounded-lg text-center border border-stone-200">
                        <p className="text-stone-600 mb-4">Want to plan your next course or grab a drink?</p>
                        <button
                            onClick={onViewMenu}
                            className="inline-flex items-center justify-center bg-stone-200 text-stone-800 font-bold py-3 px-6 rounded-lg hover:bg-stone-300 transition-colors duration-200 transform hover:scale-105"
                            aria-label="Return to menu"
                        >
                            <BookOpenIcon className="h-5 w-5 mr-3" />
                            Browse Full Menu
                        </button>
                    </div>
                )}
            </div>
            {paymentOrder && (
                <PaymentModal
                    order={paymentOrder}
                    qrCodeUrl={qrCodeUrl}
                    recipientName={recipientName}
                    upiId={upiId}
                    onClose={() => setPaymentOrder(null)}
                />
            )}
        </div>
    );
};

export default OrderTracker;