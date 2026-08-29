
import React, { useState } from 'react';
import { TableCellsIcon, CalendarDaysIcon, ClockIcon, InformationCircleIcon } from './Icons';

interface TableSelectionViewProps {
    totalTables: number;
    unavailableTables: number[];
    onSelectTable: (table: number) => void;
    onPreorderDateTimeChange: (date: Date | null) => void;
    addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const TableSelectionView: React.FC<TableSelectionViewProps> = ({ totalTables, unavailableTables, onSelectTable, onPreorderDateTimeChange, addNotification }) => {
    const [isPreordering, setIsPreordering] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleDateTimeChange = () => {
        if (date && time) {
            const [year, month, day] = date.split('-').map(Number);
            const [hours, minutes] = time.split(':').map(Number);
            const selectedDateTime = new Date(year, month - 1, day, hours, minutes);

            if (selectedDateTime < new Date()) {
                addNotification("You can't schedule a pre-order in the past.", "error");
                onPreorderDateTimeChange(null);
            } else {
                onPreorderDateTimeChange(selectedDateTime);
                addNotification(`Pre-order time set for ${selectedDateTime.toLocaleDateString()}. Please select a table.`, "info");
            }
        } else {
            onPreorderDateTimeChange(null);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="bg-white/70 backdrop-blur-sm border border-stone-200 rounded-xl p-6 sm:p-8 shadow-lg text-center">
                <h2 className="text-4xl font-extrabold text-stone-900 font-cinzel">Welcome</h2>
                <p className="mt-2 text-stone-600">Please select a table to begin your dining experience.</p>
                
                <div className="my-8 p-4 bg-stone-50 rounded-lg border border-stone-200">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <label className="font-semibold text-stone-700">Are you booking in advance?</label>
                        <button 
                            onClick={() => {
                                setIsPreordering(!isPreordering);
                                onPreorderDateTimeChange(null);
                                setDate('');
                                setTime('');
                            }}
                            className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${isPreordering ? 'bg-amber-600' : 'bg-stone-300'}`}
                        >
                            <span className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ${isPreordering ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    {isPreordering && (
                        <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-300">
                           <div className="relative">
                                <CalendarDaysIcon className="h-5 w-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                <input 
                                    type="date" 
                                    min={today}
                                    value={date}
                                    onChange={(e) => { setDate(e.target.value); handleDateTimeChange(); }}
                                    className="bg-white border border-stone-300 rounded-full py-2 pl-10 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                           </div>
                           <div className="relative">
                                <ClockIcon className="h-5 w-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                <input 
                                    type="time" 
                                    value={time}
                                    onChange={(e) => { setTime(e.target.value); handleDateTimeChange(); }}
                                    className="bg-white border border-stone-300 rounded-full py-2 pl-10 pr-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-4">
                    {Array.from({ length: totalTables }, (_, i) => i + 1).map(tableNumber => {
                        const isUnavailable = unavailableTables.includes(tableNumber);
                        return (
                            <button
                                key={tableNumber}
                                onClick={() => onSelectTable(tableNumber)}
                                disabled={isUnavailable}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center font-bold text-lg transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-amber-500
                                    ${isUnavailable
                                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                                        : 'bg-amber-600 text-white hover:bg-amber-700'
                                    }`
                                }
                            >
                                <TableCellsIcon className="h-6 w-6 mb-1" />
                                {tableNumber}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 flex items-center justify-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-amber-600 border-2 border-white ring-1 ring-stone-200"></div>
                        <span className="text-sm text-stone-600">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-stone-300 border-2 border-white ring-1 ring-stone-200"></div>
                        <span className="text-sm text-stone-600">Unavailable</span>
                    </div>
                </div>

                {isPreordering && (
                    <div className="mt-6 flex items-start justify-center p-3 bg-amber-50 text-amber-800 rounded-lg text-sm">
                        <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        <p>Unavailable tables are shown for the selected pre-order time. Availability may differ for other times.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableSelectionView;
