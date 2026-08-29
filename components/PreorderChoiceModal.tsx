
import React from 'react';
import { ShoppingBagIcon, ClockIcon } from './Icons';

interface PreorderChoiceModalProps {
    tableNumber: number;
    dateTime: Date;
    onOrderNow: () => void;
    onDecideLater: () => void;
}

const PreorderChoiceModal: React.FC<PreorderChoiceModalProps> = ({ tableNumber, dateTime, onOrderNow, onDecideLater }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative border border-stone-200 text-center" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <span className="text-4xl" role="img" aria-label="Party Popper">🎉</span>
                    </span>
                    <h3 className="text-2xl font-bold text-stone-900 font-cinzel">Your Table is Reserved!</h3>
                    <p className="mt-2 text-stone-600">
                        You have successfully reserved <span className="font-bold text-amber-700">Table {tableNumber}</span> for
                        <br />
                        <span className="font-bold text-amber-700">{dateTime.toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>.
                    </p>
                    <p className="mt-6 text-lg text-stone-700">What's next?</p>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={onOrderNow}
                        className="flex flex-col items-center justify-center p-6 bg-stone-50 rounded-lg border border-stone-200 hover:bg-amber-100 hover:border-amber-300 transition-colors group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-amber-500"
                    >
                        <ShoppingBagIcon className="h-10 w-10 mb-3 text-amber-600 transition-colors" />
                        <span className="font-semibold text-lg text-stone-800">Order Food Now</span>
                        <span className="text-sm text-stone-500 mt-1 transition-colors">Browse the menu and place your order in advance.</span>
                    </button>
                    <button
                        onClick={onDecideLater}
                        className="flex flex-col items-center justify-center p-6 bg-stone-50 rounded-lg border border-stone-200 hover:bg-blue-100 hover:border-blue-300 transition-colors group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500"
                    >
                        <ClockIcon className="h-10 w-10 mb-3 text-blue-600 transition-colors" />
                        <span className="font-semibold text-lg text-stone-800">Decide at Restaurant</span>
                        <span className="text-sm text-stone-500 mt-1 transition-colors">Just keep the table reserved and order when you arrive.</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreorderChoiceModal;
