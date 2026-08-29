
import React from 'react';
import type { TableStatus } from '../types';
import { TOTAL_TABLES } from '../constants';

interface TableManagerProps {
    statuses: TableStatus[];
    onUpdateStatus: (tableNumber: number, newStatus: 'available' | 'unavailable') => void;
}

const TableManager: React.FC<TableManagerProps> = ({ statuses, onUpdateStatus }) => {
    const getStatus = (tableNumber: number) => {
        return statuses.find(s => s.tableNumber === tableNumber)?.status || 'available';
    };

    const handleToggle = (tableNumber: number) => {
        const currentStatus = getStatus(tableNumber);
        const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
        onUpdateStatus(tableNumber, newStatus);
    };

    return (
        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <p className="text-sm text-stone-500 mb-4">Click a table to manually toggle its availability for customers.</p>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1).map(number => {
                    const status = getStatus(number);
                    const isAvailable = status === 'available';
                    return (
                        <button
                            key={number}
                            onClick={() => handleToggle(number)}
                            className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-amber-500 ${
                                isAvailable ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                            aria-label={`Table ${number}, status: ${status}. Click to toggle.`}
                        >
                            {number}
                        </button>
                    );
                })}
            </div>
            <div className="mt-4 flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white ring-1 ring-stone-200"></div>
                    <span className="text-sm text-stone-600">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white ring-1 ring-stone-200"></div>
                    <span className="text-sm text-stone-600">Unavailable</span>
                </div>
            </div>
        </div>
    );
};

export default TableManager;
