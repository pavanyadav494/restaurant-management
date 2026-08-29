import React from 'react';
// FIX: Changed import for PanelType from 'import type' to a value import because it's an enum used as a value.
import { PanelType } from '../types';
import { UserCircleIcon, ShoppingBagIcon, Cog8ToothIcon, ArrowLeftOnRectangleIcon } from './Icons';

interface HeaderProps {
    currentPanel: PanelType;
    onPanelSwitch: (panel: PanelType) => void;
    isLoggedIn: boolean;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPanel, onPanelSwitch, isLoggedIn, onLogout }) => {
    return (
        <header className="bg-amber-50/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm border-b border-stone-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <ShoppingBagIcon className="h-8 w-8 text-amber-600" />
                        <h1 className="text-2xl font-bold text-stone-900 font-cinzel">
                            Randi mava <span className="text-amber-600">restaurent</span>
                        </h1>
                    </div>
                    <nav className="flex items-center space-x-2">
                        <button
                            onClick={() => onPanelSwitch(PanelType.CUSTOMER)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                currentPanel === PanelType.CUSTOMER ? 'bg-amber-700 text-white' : 'text-stone-600 hover:bg-amber-100 hover:text-stone-900'
                            }`}
                        >
                            <UserCircleIcon className="inline-block h-5 w-5 mr-1" />
                            Customer
                        </button>
                        <button
                            onClick={() => onPanelSwitch(PanelType.ADMIN)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                currentPanel === PanelType.ADMIN ? 'bg-amber-700 text-white' : 'text-stone-600 hover:bg-amber-100 hover:text-stone-900'
                            }`}
                        >
                           <Cog8ToothIcon className="inline-block h-5 w-5 mr-1" />
                            Admin
                        </button>
                        {isLoggedIn && (
                             <button
                                onClick={onLogout}
                                className="px-3 py-2 rounded-md text-sm font-medium text-stone-600 hover:bg-red-500 hover:text-white transition-colors duration-200"
                            >
                                <ArrowLeftOnRectangleIcon className="inline-block h-5 w-5 mr-1" />
                                Logout
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;