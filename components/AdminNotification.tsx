import React, { useEffect, useState, useMemo } from 'react';
import { BellIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from './Icons';
import type { Notification } from '../types';

interface AdminNotificationProps {
    notification: Notification;
    onDismiss: (id: number) => void;
}

const NOTIFICATION_DURATION = 5000; // 5 seconds
const ANIMATION_DURATION = 300; // ms

const AdminNotification: React.FC<AdminNotificationProps> = ({ notification, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            handleClose();
        }, NOTIFICATION_DURATION);

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onDismiss(notification.id);
        }, ANIMATION_DURATION);
    };
    
    const typeStyles = useMemo(() => {
        switch (notification.type) {
            case 'success':
                return {
                    icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
                    borderColor: 'border-green-500',
                    progressBarColor: 'bg-green-500',
                };
             case 'error':
                 return {
                    icon: <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />,
                    borderColor: 'border-red-500',
                    progressBarColor: 'bg-red-500',
                };
            case 'info':
            default:
                return {
                    icon: <BellIcon className="h-6 w-6 text-amber-600" />,
                    borderColor: 'border-amber-500',
                    progressBarColor: 'bg-amber-500',
                };
        }
    }, [notification.type]);

    return (
        <div
            className={`relative w-full bg-white shadow-lg rounded-lg pointer-events-auto overflow-hidden transform transition-all duration-300 ease-in-out cursor-pointer hover:bg-stone-50 border-l-4 ${typeStyles.borderColor}
                ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        >
            <div className="p-4 flex items-start">
                <div className="flex-shrink-0">
                    {typeStyles.icon}
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-stone-800">{notification.message}</p>
                    {notification.type === 'info' && <p className="mt-1 text-sm text-stone-500">Click to view the orders queue.</p>}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent parent onClick
                            handleClose();
                        }}
                        className="inline-flex rounded-md p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 ${typeStyles.progressBarColor} progress-bar-animate-5s`}></div>
        </div>
    );
};

export default AdminNotification;