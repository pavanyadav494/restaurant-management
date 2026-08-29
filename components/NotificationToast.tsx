import React, { useEffect, useState, useMemo } from 'react';
import { CheckCircleIcon, XMarkIcon, InformationCircleIcon, ExclamationTriangleIcon } from './Icons';
import type { Notification } from '../types';

interface NotificationToastProps {
    notification: Notification;
    onExited: (id: number) => void;
}

const NOTIFICATION_DURATION = 4000; // 4 seconds
const ANIMATION_DURATION = 300; // ms

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onExited }) => {
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
            onExited(notification.id);
        }, ANIMATION_DURATION);
    };

    const typeStyles = useMemo(() => {
        switch (notification.type) {
            case 'error':
                return {
                    icon: <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />,
                    borderColor: 'border-red-500',
                    progressBarColor: 'bg-red-500',
                };
            case 'info':
                return {
                    icon: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
                    borderColor: 'border-blue-500',
                    progressBarColor: 'bg-blue-500',
                };
            case 'success':
            default:
                return {
                    icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
                    borderColor: 'border-green-500',
                    progressBarColor: 'bg-green-500',
                };
        }
    }, [notification.type]);

    return (
        <div
            className={`relative w-full max-w-md bg-white shadow-lg rounded-lg pointer-events-auto overflow-hidden transform transition-all duration-300 ease-in-out border-l-4 ${typeStyles.borderColor} ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
        >
            <div className="p-4 flex items-start">
                <div className="flex-shrink-0">{typeStyles.icon}</div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-stone-800">{notification.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={handleClose}
                        className="inline-flex rounded-md text-stone-500 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-amber-500"
                    >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 ${typeStyles.progressBarColor} progress-bar-animate`}></div>
        </div>
    );
};

export default NotificationToast;